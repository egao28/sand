/** Screen-recording clip on a project detail page: poster, controls, caption.
 * Rendered both from a project's `demoVideo` entry in siteContent (via the
 * shared ProjectDetailPage) and from the bespoke pages, so the markup and the
 * loading behaviour stay in one place. `caption` defaults to the no-audio note
 * every clip so far has needed — pass your own for a clip with sound, or a
 * falsy value to drop the line. */
export default function DemoVideo({
  src,
  poster,
  width,
  height,
  ariaLabel,
  caption = 'Screen recording — no audio.',
}) {
  return (
    <figure className="project-detail-video">
      <video
        className="project-detail-video-player"
        aria-label={ariaLabel}
        controls
        preload="none"
        playsInline
        poster={poster}
        width={width}
        height={height}
      >
        <source src={src} type="video/mp4" />
        Your browser cannot play this video.
      </video>
      {caption && <figcaption className="project-detail-video-caption">{caption}</figcaption>}
    </figure>
  )
}
