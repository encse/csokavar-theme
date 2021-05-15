import MarkdownIt from 'markdown-it';
import metadataParse from 'markdown-yaml-metadata-parser';
import { slugify, formatDate, zeroPad } from "./util";
import * as React from 'react';

export type PageTemplateProps = {
    headingClasses: string[],
    title: React.ReactChild,
    subtitle: React.ReactChild,
    featuredImage: string,
    postContent: React.ReactChild
    footer:React.ReactChild
}

type Template<T> = (t:T) => string;

export class PostList {
    readonly htmlContent: string;
    constructor(
        template: Template<PageTemplateProps>, 
        title: string,
        subtitle: string, 
        coverImage: string, 
        baseUri: string, 
        posts: Post[], 
        page: number, 
        postCount: number
    ) {
        let content: React.ReactElement<any>[] = [];
        for (let post of posts) {
            content.push(
                <article>
                    <header>
                        <h2 className="title"><a href={post.uri} rel="bookmark">{post.title}</a></h2>
                        <p className="subtitle">{formatDate(post.date)}</p>
                    </header>
                    <section>
                        {post.excerpt}
                    </section>
                </article>
            );
        }

        const hasPrev = page > 1;
        const hasNext = postCount / posts.length > page;

        if (hasPrev || hasNext) {
            content.push(
                <div className="pager">
                    {
                        hasPrev && page > 2 ? 
                            <div className="previous"><a href={`${baseUri}/page/${page - 1}`}>« Előző</a></div> :
                        hasPrev ? 
                            <div className="previous"><a href={baseUri}>« Előző</a></div> :
                        null
                    }
                    {
                        hasNext ? 
                            <div className="next"><a href={`${baseUri}/page/${page + 1}`}>Következő »</a></div> :
                        null
                    }
                </div>
            );
        }

        this.htmlContent = template(
            {
                headingClasses: ['home-page-heading'],
                title, subtitle, 
                featuredImage: coverImage,
                postContent: <>{content}</>,
                footer: null
            }
        )
    }
}

function markdownToReact(md: string): React.ReactElement<any>{
    const markdownIt = MarkdownIt({
        html: true
    });
    return <div dangerouslySetInnerHTML={{__html: markdownIt.render(md)}} />
}

export class Page {
    readonly title: string;
    readonly coverImage: string;
    readonly date: Date;
    readonly tags: string[];
    readonly htmlContent: string;
    readonly slug: string;

    constructor(template: Template<PageTemplateProps>, md: string) {
        const { metadata, content } = metadataParse(md);
        this.date = new Date(metadata.date);
        this.title = metadata.title;
        this.coverImage = metadata.coverImage;
        this.tags = metadata.tags || [];
        this.slug = metadata.slug || slugify(this.title);

        this.htmlContent = template(
            {
                headingClasses: ['home-page-heading'],
                title: metadata.title, 
                subtitle: metadata.subtitle, 
                featuredImage: `images/${metadata.coverImage}`,
                postContent: markdownToReact(content),
                footer: null
            }
        )
    }
}

export class Post {
    readonly title: string;
    readonly coverImage: string;
    readonly date: Date;
    readonly tags: string[];
    readonly htmlContent: string;
    readonly slug: string;
    readonly uri: string;
    readonly excerpt: React.ReactElement<any>;


    constructor(template: Template<PageTemplateProps>, md: string) {
        const { metadata, content } = metadataParse(md);
        this.date = new Date(metadata.date);
        this.title = metadata.title;
        this.coverImage = `images/${metadata.coverImage}`;
        this.tags = metadata.tags || [];
        this.slug = metadata.slug || slugify(this.title);

        let footer: React.ReactElement = null;
        if (this.tags.length > 0) {
            footer = <p>
                <span className="tags-icon" />
                {this.tags.map((tag, i) => [
                    i == 0 ? ' ' : ', ',
                    <a href={`/blog/tag/${tag}/`} rel="tag">{tag}</a>
                ])}
            </p>
        }

        this.htmlContent = template(
            {
                headingClasses: [],
                title: metadata.title, 
                subtitle: <time className="posted-on" dateTime={this.date.toISOString()}>{formatDate(this.date)}</time>, 
                featuredImage: `images/${metadata.coverImage}`,
                postContent: markdownToReact(content),
                footer: footer
            }
        )

        this.uri = `/blog/${zeroPad(this.date.getFullYear(), 4)}/${zeroPad(this.date.getMonth() + 1, 2)}/${this.slug}/`;

        this.excerpt = <></>;

        const markdownIt = MarkdownIt({
            html: true
        });
        
        for (let block of markdownIt.parse(content, {})) {
            if (block.content != '') {
                this.excerpt = 
                    <p>
                        <span dangerouslySetInnerHTML={{__html:markdownIt.renderer.render([block], {html: true}, {})} }/>
                        <a href={this.uri} rel="bookmark">…</a>
                    </p>;
                break;
            }
        }
    }
}
