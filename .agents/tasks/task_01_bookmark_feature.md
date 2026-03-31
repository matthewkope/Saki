# Task 01: The Bookmark Save Feature Redesign

**Assigned To:** Claudia (Claude Code)
**Status:** `[DONE]`

## Context
We are removing the old manual "Save" bar functionality on the Reading Pages and replacing it with a modern, "Medium-Style" Bookmark Micro-Animation. This provides a sleek, native feeling for the user without cluttering the viewport.

## Objective
Implement a reusable `SaveBookmark` component and integrate it into the **Personal Reading** (`cue-next/app/reading`) and **Compatibility** (`cue-next/app/compatibility/page.tsx`) calculators.

## Requirements

### 1. The `SaveBookmark` Component
- Create a new reusable component (e.g., `cue-next/components/SaveBookmark.tsx`).
- It must accept `isSaved` (boolean) and an `onToggleSave` function as props.
- Add an optimistic UI update: when clicked, it should immediately toggle the local `isSaved` state visually, then trigger the callback.

### 2. UI & Styling
- **Default State**: A clean outline of a bookmark (using Lucide icons, Heroicons, or an SVG). The outline should be a subtle gray/slate color that matches the app's muted foreground text.
- **Hover State**: Slightly lower opacity or alter the cursor to a pointer. A subtle tooltip saying "Save Profile/Reading" can appear.
- **Active / Saved State**: 
  - The inside of the bookmark must fill in completely using a brand-appropriate, vibrant accent color.
  - Implement a CSS micro-animation: A quick "pop" or "bounce" effect (e.g., scaling up slightly 1.2x and then springing back) using standard CSS `@keyframes` or Framer Motion.

**Example Base CSS Keyframe:**
```css
@keyframes bookmark-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
```

### 3. Integration Targets
1. **Personal Reading Page**: Locate the main headers or the "personal reading" logic and seamlessly insert the bookmark next to the title or aligned in the top right.
2. **Compatibility Page**: (`cue-next/app/compatibility/page.tsx`). Insert the `SaveBookmark` component near the primary heading of the generated compatibility results.

## Acceptance Criteria
- [ ] Bookmark component built and styled.
- [ ] Micro-animation triggers smoothly on click.
- [ ] Integrated correctly on Both reading and compatibility endpoints.
- [ ] Status of this file updated to `[DONE]`.
