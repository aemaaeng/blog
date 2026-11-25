import { i18n } from "../i18n"
import { FullSlug, getFileExtension, isFolderPath, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../../.quartz/plugins"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
    allFiles,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    // 홈 글 목록(recent-notes)에 한 줄 설명을 붙이기 위한 slug → description 맵.
    // 같은 스크립트에서 지금 보고 있는 글의 항목에 .is-current를 붙인다(글 하단 목록에서 "현재 글" 표시).
    // 백링크 제목("백링크")도 여기서 "이 글을 언급한 글"로 바꾼다(플러그인에 제목 옵션이 없음).
    // recent-notes 플러그인은 .quartz/(빌드마다 재설치)에 있어 직접 수정할 수 없으므로,
    // 빌드타임에 만든 맵을 인라인으로 심고 아래 스크립트에서 DOM에 주입한다.
    // unlisted 페이지와 폴더 페이지(홈 index 포함)는 목록에 뜨지 않으므로 설명도 내보내지 않는다.
    // allFiles에는 그대로 남아 있어 RecentNotes(filterListedPages · hideFolderPages)와
    // 같은 기준으로 걸러야 한다.
    // 암호화 페이지는 본문과 data.description만 비워지고 frontmatter.description은 남으므로
    // (unlistWhenEncrypted: false면 목록에도 남는다) 여기서 따로 제외해야 요약이 새지 않는다.
    const recentDescriptions = Object.fromEntries(
      (allFiles ?? [])
        .filter(
          (f) =>
            f.slug &&
            f.unlisted !== true &&
            f.encrypted !== true &&
            !isFolderPath(f.slug) &&
            typeof f.frontmatter?.description === "string",
        )
        .map((f) => [f.slug as string, (f.frontmatter!.description as string).trim()])
        .filter(([, d]) => d.length > 0),
    )
    const recentDescriptionsJson = JSON.stringify(recentDescriptions).replace(/</g, "\\u003c")

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var D=${recentDescriptionsJson};function slugOf(a){var h=a.getAttribute("href")||"";try{h=decodeURIComponent(h);}catch(e){}return h.replace(/^(?:\\.\\.?\\/)+/,"").replace(/^\\//,"").replace(/\\/$/,"").replace(/#.*$/,"");}function decorate(){var cur=document.body.dataset.slug||"";document.querySelectorAll(".backlinks > h3").forEach(function(h){h.textContent="이 글을 언급한 글";});document.querySelectorAll(".recent-notes .recent-li").forEach(function(li){var a0=li.querySelector(".desc h3 a");if(a0)li.classList.toggle("is-current",slugOf(a0)===cur);if(li.dataset.descBound==="true")return;var a=li.querySelector(".desc h3 a");if(!a)return;li.dataset.descBound="true";var k=slugOf(a);if(!Object.prototype.hasOwnProperty.call(D,k))return;var d=D[k];if(!d)return;var h3=a.closest("h3");if(!h3)return;var p=document.createElement("p");p.className="recent-desc";p.textContent=d;h3.insertAdjacentElement("afterend",p);});}function run(){decorate();setTimeout(decorate,150);setTimeout(decorate,400);}document.addEventListener("DOMContentLoaded",run);document.addEventListener("nav",run);})();`,
          }}
        />
        {/* 모바일 푸터의 "맨 위로" 버튼. footer는 플러그인 소관이라 DOM에 주입하고, SPA 이동(nav)마다 다시 붙인다. 표시 여부는 custom.scss(모바일만). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function add(){var f=document.querySelector("footer");if(!f||f.querySelector(".to-top"))return;var b=document.createElement("button");b.type="button";b.className="to-top";b.setAttribute("aria-label","맨 위로");b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';b.addEventListener("click",function(){var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;window.scrollTo({top:0,behavior:r?"auto":"smooth"});});f.appendChild(b);}document.addEventListener("DOMContentLoaded",add);document.addEventListener("nav",add);})();`,
          }}
        />
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
