<script lang="ts">
	export let lawJSON: any;

	function detectLinks(text: string): string {
		const articleLinkPattern = /제(\d+)조/g;

		text = text.replace(articleLinkPattern, (match, articleNumber) => {
			return `<a class="law-ref" href="#article-${articleNumber}">${match}</a>`;
		});

		return text;
	}

	function formatClauseNumber(clauseNumber: string): string {
		// ①
		const clauseNumberMap: { [key: string]: string } = {
			'1': '①',
			'2': '②',
			'3': '③',
			'4': '④',
			'5': '⑤',
			'6': '⑥',
			'7': '⑦',
			'8': '⑧',
			'9': '⑨',
			'10': '⑩',
			'11': '⑪',
			'12': '⑫',
			'13': '⑬',
			'14': '⑭',
			'15': '⑮',
			'16': '⑯',
			'17': '⑰',
			'18': '⑱',
			'19': '⑲',
			'20': '⑳',
			'21': '㉑',
			'22': '㉒',
			'23': '㉓',
			'24': '㉔',
			'25': '㉕',
			'26': '㉖',
			'27': '㉗',
			'28': '㉘',
			'29': '㉙',
			'30': '㉚',
			'31': '㉛',
			'32': '㉜',
			'33': '㉝',
			'34': '㉞',
			'35': '㉟',
			'36': '㊱',
			'37': '㊲',
			'38': '㊳',
			'39': '㊴',
			'40': '㊵',
			'41': '㊶',
			'42': '㊷',
			'43': '㊸',
			'44': '㊹',
			'45': '㊺',
			'46': '㊻',
			'47': '㊼',
			'48': '㊽',
			'49': '㊾',
			'50': '㊿'
		};

		return clauseNumberMap[clauseNumber] || clauseNumber;
	}

	function getArticleId(
		chapterNumber: string,
		sectionNumber: string,
		articleNumber: string
	): string {
		let id = 'article-';
		id += chapterNumber + '-';
		id += sectionNumber + '-';
		id += articleNumber;
		return id;
	}
</script>

{#each lawJSON.chapters as chapter, ci}
	<div class="chapter-header">
		{#if chapter.number !== '0'}
			<span class="chapter-number">제{chapter.number}장</span>
		{/if}
		<span class="chapter-title">{chapter.title}</span>
	</div>
	<div class="chapter-contents">
		{#each chapter.sections as section, si}
			{#if section.number !== '0'}
				<div class="section-header">
					<span class="section-number">제{section.number}절</span>
					<span class="section-title">{section.title}</span>
				</div>
			{/if}
			<div class="section-contents">
				{#each section.articles as article, ai}
					<div class="article" id={getArticleId(chapter.number, section.number, article.number)}>
						{#if article.number !== '0'}
							<span class="article-number">
								{#if chapter.title === '부칙'}부칙{/if}제{article.number}{#if article.number.indexOf('의') === -1}조{/if}
							</span>
						{/if}
						{#if article.title}
							<span class="article-title">({article.title})</span>
						{/if}
						<span class="article-text">{@html detectLinks(article.text)}</span>
					</div>
					{#if article.clauses}
						<div class="clauses">
							{#each article.clauses as clause, cli}
								<div class="clause">
									<span class="clause-number">{formatClauseNumber(clause.number)}</span>
									<span class="clause-text">{@html detectLinks(clause.text)}</span>
								</div>
								{#if clause.items}
									<div class="items">
										{#each clause.items as item, ii}
											<div class="item">
												<span class="item-number">{item.number}.</span>
												<span class="item-title">{item.text}</span>
											</div>
										{/each}
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
{/each}

<style>
	.chapter-header {
		margin-top: 1.5rem;
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.section-header {
		margin-top: 1rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.article-number {
		font-weight: bold;
	}

	.article {
		margin-top: 1rem;
	}

	.article-title {
		font-size: 0.8rem;
	}

	.clause {
		margin-top: 0.5rem;
	}

	.items {
		margin-top: 0.2rem;
		margin-bottom: 0.2rem;
	}

	.item {
		margin-left: 1.5rem;
	}
</style>
