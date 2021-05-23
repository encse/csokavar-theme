import StateInline from 'markdown-it/lib/rules_inline/state_inline';
import StateBlock from 'markdown-it/lib/rules_block/state_block';
import { iframe } from './iframe';
import MarkdownIt, { PluginWithOptions } from 'markdown-it';
import Token from 'markdown-it/lib/token';
import ReactDOMServer from 'react-dom/server';
import * as React from 'react';
import { AssetManager, ImageAsset } from './assets';

type GalleryPluginOptions = {
  assetManager: AssetManager
}

export default function plugin(md: MarkdownIt, options: GalleryPluginOptions) {
  const { assetManager } = options;

  function galleryToken(tokens: Token[], idx: number, options, env, self) {

    const token = tokens[idx];
    const src: string[] = JSON.parse(token.attrGet("src"));

    const image = assetManager.lookup(src[0]);

    return ReactDOMServer.renderToStaticMarkup(
      <div id="jtg-4716" className="modula modula-gallery modula-creative-gallery"
        data-config="{&quot;height&quot;:800,&quot;enableTwitter&quot;:false,&quot;enableWhatsapp&quot;:false,&quot;enableFacebook&quot;:false,&quot;enablePinterest&quot;:false,&quot;enableLinkedin&quot;:false,&quot;enableEmail&quot;:false,&quot;randomFactor&quot;:0.5,&quot;type&quot;:&quot;creative-gallery&quot;,&quot;columns&quot;:12,&quot;gutter&quot;:10,&quot;mobileGutter&quot;:10,&quot;tabletGutter&quot;:10,&quot;desktopGutter&quot;:10,&quot;enableResponsive&quot;:&quot;0&quot;,&quot;tabletColumns&quot;:&quot;2&quot;,&quot;mobileColumns&quot;:&quot;1&quot;,&quot;lazyLoad&quot;:&quot;0&quot;,&quot;lightboxOpts&quot;:{&quot;loop&quot;:false,&quot;arrows&quot;:true,&quot;toolbar&quot;:true,&quot;keyboard&quot;:false,&quot;wheel&quot;:false,&quot;buttons&quot;:[&quot;close&quot;],&quot;hash&quot;:false,&quot;lang&quot;:&quot;en&quot;,&quot;touch&quot;:false,&quot;protect&quot;:false,&quot;i18n&quot;:{&quot;en&quot;:{&quot;CLOSE&quot;:&quot;Close&quot;,&quot;NEXT&quot;:&quot;Next&quot;,&quot;PREV&quot;:&quot;Previous&quot;,&quot;Error&quot;:&quot;The requested content cannot be loaded. Please try again later.&quot;,&quot;PLAY_START&quot;:&quot;Start slideshow&quot;,&quot;PLAY_STOP&quot;:&quot;Pause slideshow&quot;,&quot;FULL_SCREEN&quot;:&quot;Full screen&quot;,&quot;THUMBS&quot;:&quot;Thumbnails&quot;,&quot;DOWNLOAD&quot;:&quot;Download&quot;,&quot;SHARE&quot;:&quot;Share&quot;,&quot;ZOOM&quot;:&quot;Zoom&quot;}},&quot;clickSlide&quot;:false,&quot;clickOutside&quot;:false,&quot;dblclickContent&quot;:false,&quot;dblclickSlide&quot;:false,&quot;dblclickOutside&quot;:false,&quot;clickContent&quot;:false,&quot;baseTpl&quot;:&quot;&lt;div class=\&quot;modula-fancybox-container modula-lightbox-jtg-4716\&quot; role=\&quot;dialog\&quot; tabindex=\&quot;-1\&quot;&gt;&lt;div class=\&quot;modula-fancybox-bg\&quot;&gt;&lt;\/div&gt;&lt;div class=\&quot;modula-fancybox-inner\&quot;&gt;&lt;div class=\&quot;modula-fancybox-infobar\&quot;&gt;&lt;span data-fancybox-index&gt;&lt;\/span&gt;&nbsp;\/&nbsp;&lt;span data-fancybox-count&gt;&lt;\/span&gt;&lt;\/div&gt;&lt;div class=\&quot;modula-fancybox-toolbar\&quot;&gt;{{buttons}}&lt;\/div&gt;&lt;div class=\&quot;modula-fancybox-navigation\&quot;&gt;{{arrows}}&lt;\/div&gt;&lt;div class=\&quot;modula-fancybox-stage\&quot;&gt;&lt;\/div&gt;&lt;div class=\&quot;modula-fancybox-caption\&quot;&gt;&lt;div class=\&quot;modula-fancybox-caption__body\&quot;&gt;&lt;\/div&gt;&lt;\/div&gt;&lt;\/div&gt;&lt;\/div&gt;&quot;},&quot;inView&quot;:false,&quot;email_subject&quot;:&quot;Check out this awesome image !!&quot;,&quot;email_message&quot;:&quot;Here is the link to the image : %%image_link%% and this is the link to the gallery : %%gallery_link%%&quot;,&quot;lightbox&quot;:&quot;fancybox&quot;}">
        <div className="modula-items">
          {
            src.map(item => {
              const asset = assetManager.lookup(item);
              const width = asset.width > asset.height ? 500 : Math.round(asset.width * 500 / asset.height);
              const height = asset.height > asset.width ? 500 : Math.round(asset.height * 500 / asset.width);

              if (asset.kind != 'imageAsset') {
                throw new Error('imageAsset expected');
              }

              // // 
              // data-caption={asset.caption}
              // rel="jtg-4716"
              // data-image-id={asset.uri}

              // 
              // data-caption=""
              //    data-valign="middle"
              // data-halign="center"
              // data-src={asset.uri}
              // alt=""
              // data-full={asset.uri}
              // title={asset.caption} 
              // sizes={`(max-width: ${width}px) 100vw, ${width}px`} 
              // 
              // 
              return (
                <div className="modula-item effect-pufrobo">
                  <div className="modula-item-overlay"></div>
                  <div className="modula-item-content">{" "}
                    <a

                      href={asset.uri}
                      className="tile-inner modula-item-link"
                    ></a>{" "}
                    <img
                      className="pic" 
                   
                      width={width}
                      height={height}
                      src={asset.uri}

                    />
                    <div className="figc no-description">
                      <div className="figc-inner"></div>
                    </div>
                  </div>
                </div>
              );
            })
          }

        </div>

      </div>
    );
  };
  md.renderer.rules['gallery_token'] = galleryToken;


  function process(state: StateBlock, startLine: number, endLine: number, silent: boolean) {
    const rx = /\[gallery\](.*)\[\/gallery\]/sm;

    function getLine(i: number) {
      return state.src.slice(state.bMarks[i], state.eMarks[i]).trim();
    }

    let i = startLine;
    const items: string[] = [];
    if (getLine(i) != '[gallery]') {
      return false;
    }
    i++;
    while (getLine(i) != '[/gallery]') {
      items.push(getLine(i).trim());
      i++;
      if (startLine > endLine) {
        return false;
      }
    }
    state.line = i + 1;

    if (!silent) {
      const token = state.push("gallery_token", "", 0);
      token.attrs = [["src", JSON.stringify(items)]];
    }

    return true;
  }

  md.block.ruler.before("table", "gallery", process)
}
