import { slugify, removeAccents } from "./util";
import { AssetManager, ImageAsset } from './assets';
import { Template, PageTemplateProps, Post } from './post';
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import { PostList } from './postList';
import styled from 'styled-components';
import { SearchIcon } from "./components/fontAwesame";
import { ServerStyleSheet } from 'styled-components';

const Search = styled.div`
    width: 100%;
    background: white;
    border-radius: 8px;
    
    padding: 8px 0;
    
    display: flex;
    flex-wrap: wrap;
    color: black;
`;

const SearchInput = styled.input`
    flex-grow: 1;
    outline: 0;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    padding-left: 16px;
`;

const SearchSuggestionsWrapper = styled.div`
    position:relative;
    width: 100%;
`;

const SearchSuggestions = styled.div`
    position:absolute;
    width: 100%;
    background: white;

    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: hidden;
    
    a {
        display: block;
        padding: 8px 16px;
        outline: none;
        &:hover, &:active, &:focus {
            background: gray;
            color: white;
            
        }
    }
`;
const StyledSearchIcon = styled(SearchIcon)`
    padding-right:16px;
`;

export class SearchPage {
    readonly title: string;
    readonly subtitle: string;
    readonly uri: string;
    readonly coverImage: ImageAsset;
    readonly mdContent: string;
    readonly #template: Template<PageTemplateProps>;

    constructor(
        template: Template<PageTemplateProps>,
        private assetManager: AssetManager,
        private posts: Post[],
    ) {

        this.title = "Keresés"
        this.subtitle = null;
        this.uri = '/search/';
        this.coverImage = assetManager.lookup('site/assets/backgrounds/street.gif', "imageAsset");
        this.#template = template;
    }

    async render(): Promise<string> {

        const styleSheet = new ServerStyleSheet();
        const content = <div data-search>
            <script data-search-index type="application/json" dangerouslySetInnerHTML={{ __html: buildSearch(this.posts, styleSheet) }}>
            </script>
            <div data-search-result></div>
        </div>

        return this.#template(
            {
                homePageHeading: true,
                title: this.title,
                subtitle: <Search>
                    <SearchInput data-search-input type="search" />
                    <StyledSearchIcon/>
                    <SearchSuggestionsWrapper><SearchSuggestions data-search-suggestions/></SearchSuggestionsWrapper>
                    </Search>,
                coverImage: this.coverImage,
                postContent: content,
                footer: null,
                styleSheet: styleSheet
            }
        );
    }
}


export function buildSearch(posts: Post[], styleSheet: ServerStyleSheet): string {
    let wordToIds = new Map<string, Set<number>>();
    let keywords = new Set<string>();

    let id = 0;
    for (let id = 0; id < posts.length; id++) {
        const post = posts[id];
        for (let tagName of post.tags.map(tag => tag.name)) {
            keywords.add(tagName);
        }

        let normalized = removeAccents(post.title + " " + post.mdContent).toLowerCase();

        for (let match of normalized.matchAll(/(\w)+/g)) {
            const word = match[0];
            if (word.length > 2) {
                const key = slugify(word);
                let list = wordToIds.get(key) ?? new Set<number>();
                list.add(id);
                wordToIds.set(key, list);
            }
        }
    }

    let words = Object.fromEntries([...wordToIds.entries()].map(entry => [entry[0], [...entry[1]]]));
    let search = {
        keywords: [...keywords],
        meta: posts.map(post => ReactDOMServer.renderToStaticMarkup(styleSheet.collectStyles(PostList.renderItem(post)))),
        words
    }

    return JSON.stringify(search);
}
