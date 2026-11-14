# Automatic artwork fallback

`generate-fallbacks.py` uses ffmpeg to derive looping animated WebP from the
19 original module MP4s and the original circle. Originals remain untouched.
Rebuild with `python tools/media/generate-fallbacks.py` from any directory.

Fallbacks preserve full frame dimensions and duration, with 10 fps and WebP
quality 90. They are an autoplay-independent fallback, not lossless copies.
`fallback-manifest.json` records source hashes, source timing and output sizes.

The browser normally uses the original videos. If playback is refused, fails,
or remains stopped, PortalArtwork automatically uses the image animation.
Only the focused flight card fetches its larger image fallback; list mode uses
viewport culling. No play/reload buttons or native video controls are exposed.
Original videos retain their source frame rate and quality. The circle poster
is derived losslessly from the first original video frame.
