# Dynamic solar themes

Dynamic solar themes gradually change Halcyon's colors around sunrise and sunset. The option is off by default and available on color watches with a supporting watchface version.

## Enable or disable

Enable **Night Theme**, then enable **Dynamic solar themes** below it and save. Turning dynamic themes off restores the ordinary day/night switch. Turning Night Theme off uses the day theme throughout the day.

Older watchface versions do not show this option, and their settings saves omit its key. Update the watchface as well as the settings page to use the feature.

## Colors and transitions

The separate day/night ring sections stay in place. Transitions use the sunrise and sunset section colors already selected in each theme, without adding a fixed accent palette:

**night ring → night sunrise → day sunrise → day ring → day sunset → night sunset → night ring**

Each transition extends up to 45 minutes before and after the event. Very short days or nights shorten the windows so they do not overlap. The background eases from the center outward, using a stationary Bayer texture to soften palette steps. Text chooses between its selected day/night colors and gets a two-pixel outline during background fades.

Invalid or equal solar times keep the existing day/night decision and do not start a fade. With valid times spanning midnight, dynamic mode follows that solar day; this intentionally differs from the older mode's always-night behavior for that case. The feature does not change solar-time acquisition or solve polar-day/night behavior.

## Preview

Expand **Preview time of day** to try the selected colors at different times. The example sunrise/sunset inputs and sample widgets affect only the illustration; they never change the watch's clock, saved solar times or location. The round illustration shows palette behavior, not an exact rendering of every watch model.

## Display and battery considerations

Time-driven changes use the existing minute tick. There are no additional animation timers, location requests or sensor subscriptions, and the texture does not shift between ticks. Other existing events can still trigger redraws, which do additional drawing work during fades. The gradient weights are cached between changes, but the full background and text are still repainted when needed.

The fine texture is visible on the limited palette, and custom colors can still have poor contrast. Physical display readability, animation frame time, battery cost and Android behavior have not yet been measured. The feature remains optional so users can keep the original appearance.
