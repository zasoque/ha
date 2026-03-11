interface Law {
	chapters: LawChapter[];
}

interface LawChapter {
	number: string;
	title: string;
	sections: LawSection[];
}

interface LawSection {
	number: string;
	title: string;
	articles: LawArticle[];
}

interface LawArticle {
	number: string;
	title: string;
	text: string;
	clauses: LawClause[];
}

interface LawClause {
	number: Number;
	text: string;
	items: LawItem[];
}

interface LawItem {
	number: string;
	text: string;
}

function parseNumber(line: string, unit: string) {
	const re = new RegExp(`^제(\\d+)(?:${unit}의(\\d+)|${unit})\\s*(.*)`);
	const m = line.match(re);

	if (!m) return null;

	const base = m[1];
	const sub = m[2];
	const text = m[3] ?? '';

	const number = sub ? `${base}의${sub}` : base;

	return { number, text };
}

/**
 * 법률 텍스트 파싱
 */
export function parseLaw(text: string): Law {
	const lines = text.split('\n').map((v) => v.trim());

	const law: Law = {
		chapters: []
	};

	let currentChapter: LawChapter | null = null;
	let currentSection: LawSection | null = null;
	let currentArticle: LawArticle | null = null;
	let currentClause: LawClause | null = null;

	for (const line of lines) {
		if (!line) continue;

		if (line.startsWith('- ')) {
			// 전문 등 특수한 경우, 단순히 조문 텍스트로 취급
			if (!currentChapter) {
				currentChapter = {
					number: '0',
					title: '',
					sections: []
				};
				law.chapters.push(currentChapter);
			}
			if (!currentSection) {
				currentSection = {
					number: '0',
					title: '',
					articles: []
				};
				currentChapter.sections.push(currentSection);
			}
			if (!currentArticle) {
				currentArticle = {
					number: '0',
					title: '',
					text: '',
					clauses: []
				};
				currentSection.articles.push(currentArticle);
			}

			currentArticle.text += (currentArticle.text ? '\n' : '') + line.slice(2);
			continue;
		}

		// 장
		const chapter = parseNumber(line, '장');
		if (chapter) {
			currentChapter = {
				number: chapter.number,
				title: chapter.text,
				sections: []
			};

			law.chapters.push(currentChapter);
			currentSection = null;
			continue;
		}

		// 절
		const section = parseNumber(line, '절');
		if (section && currentChapter) {
			currentSection = {
				number: section.number,
				title: section.text,
				articles: []
			};

			currentChapter.sections.push(currentSection);
			continue;
		}

		// 조
		const m = line.match(/^제(\d+)(?:조의(\d+)|조)\s*(?:\(([^)]*)\))?\s*(.*)/);

		if (m) {
			const base = m[1];
			const sub = m[2];
			const title = m[3];
			const text = m[4];

			const number = sub ? `${base}조의${sub}` : base;

			if (!currentChapter) {
				currentChapter = {
					number: '0',
					title: '',
					sections: []
				};
				law.chapters.push(currentChapter);
			}

			if (!currentSection) {
				currentSection = {
					number: '0',
					title: '',
					articles: []
				};
				currentChapter.sections.push(currentSection);
			}

			currentArticle = {
				number,
				title,
				text: text || '',
				clauses: []
			};

			currentSection.articles.push(currentArticle);
			currentClause = null;
			continue;
		}

		// 항
		const clause = parseNumber(line, '항');
		if (clause && currentArticle) {
			currentClause = {
				number: parseInt(clause.number),
				text: clause.text,
				items: []
			};

			currentArticle.clauses.push(currentClause);
			continue;
		}

		// 목
		const item = parseNumber(line, '목');
		if (item && currentClause) {
			currentClause.items.push({
				number: item.number,
				text: item.text
			});
			continue;
		}

		// 일반 문장 → 마지막 항에 이어붙이기
		if (currentClause) {
			currentClause.text += ' ' + line;
			continue;
		}

		// 항이 없으면 조에 붙이기
		if (currentArticle) {
			if (currentArticle.clauses.length === 0) {
				currentArticle.clauses.push({
					number: '1',
					text: line,
					items: []
				});
				currentClause = currentArticle.clauses[0];
			}
		}
	}

	return law;
}
