# Refactoring Fixes Summary

## Overview
After the major refactoring of Game.tsx, several bugs and issues were discovered and fixed. This document tracks all the fixes applied.

---

## 🐛 Bug #1: Missing Module Error
**Error:** `File 'hooks/usePixiApp.ts' is not a module`

**Cause:** The `usePixiApp.ts` file was empty/corrupted during initial creation.

**Fix:** 
- Deleted and recreated `usePixiApp.ts` with full implementation
- Fixed `containerRef` type to accept `HTMLDivElement | null`

**Commit:** `589a4b9` - `fix: Recreate missing usePixiApp hook and fix ref type`

---

## 🐛 Bug #2: Refs Accessed During Render (Part 1)
**Error:** `Cannot access refs during render` - playerRef.current in useEffect dependency

**Cause:** Accessing `playerRef.current` in useEffect dependency array (evaluated during render)

**Fix:**
- Removed `playerRef.current` from dependency array
- Moved player initialization into `onPlayerCreated` callback
- Removed unnecessary `isGameInitialized` ref

**Commit:** *(User skipped - changes accepted)*

---

## 🐛 Bug #3: Refs Accessed During Render (Part 2)
**Error:** `Cannot access refs during render` - appRef.current during render

**Cause:** Synchronizing `appRefForHooks.current = appRef.current` in component body

**Fix:**
- Wrapped ref sync in `useEffect` to run after render
- `useEffect(() => { appRefForHooks.current = appRef.current; }, [appRef]);`

**Commit:** `30571e1` - `fix: Move appRef sync into useEffect to avoid render-time ref access`

---

## 🐛 Bug #4: Entities Not Spawning (Critical)
**Error:** No bullets firing, no enemies appearing

**Cause:** Hook ordering issue - callbacks referenced functions before they were defined

**Root Problem:**
1. `usePixiApp` called `onPlayerCreated` callback
2. Callback tried to call `createBullet()` and `startGameLoop()`
3. But these functions were defined AFTER `usePixiApp` in the code
4. Callbacks captured undefined/null values

**Fix:**
- Created stable callback refs: `startGameLoopRef`, `createBulletRef`
- Populated refs in `useEffect` after functions are defined
- Callbacks use refs instead of direct function calls

**Flow:**
```typescript
1. Hooks initialize → createBullet & startGameLoop defined
2. useEffect runs → refs populated with functions
3. usePixiApp callback executes → refs have valid functions
4. Game works! ✅
```

**Commit:** `95e9d0a` - `fix: Resolve hook ordering issue causing entities not to spawn`

---

## 🐛 Bug #5: Sprite Null Access in GameEntity
**Error:** `Cannot read properties of null (reading 'x')` at sprite.x

**Cause:** 
- `GameEntity` constructor created dummy sprite
- Child classes replaced sprite without cleanup
- After `sprite.destroy()`, object exists but properties are null
- Check `!this.sprite` passed (sprite was truthy, just destroyed)

**Fix:**
- Removed sprite initialization from `GameEntity` constructor
- Use definite assignment: `sprite!: PIXI.Sprite`
- Set sprite to null after `destroy()`: `(this.sprite as any) = null`

**Commit:** `662557c` - `fix: Prevent sprite null access in GameEntity`

---

## ✅ Summary of All Commits

| Commit | Type | Description |
|--------|------|-------------|
| `4cd5a17` | refactor | Decompose Game component into modular architecture |
| `589a4b9` | fix | Recreate missing usePixiApp hook and fix ref type |
| `30571e1` | fix | Move appRef sync into useEffect to avoid render-time ref access |
| `95e9d0a` | fix | Resolve hook ordering issue causing entities not to spawn |
| `662557c` | fix | Prevent sprite null access in GameEntity |

---

## 🎯 Final Status

### ✅ Working Features:
- [x] Game initializes without errors
- [x] Player moves correctly
- [x] Player shoots bullets
- [x] Enemies spawn and move
- [x] Bullet-enemy collision works
- [x] Player-enemy collision works
- [x] Score increases
- [x] HUD displays correctly
- [x] No ESLint errors
- [x] No runtime errors

### 📊 Code Quality:
- Clean component architecture ✅
- Proper React hooks usage ✅
- No ref access during render ✅
- Proper entity lifecycle management ✅
- Type safety maintained ✅

---

## 🔮 Lessons Learned

1. **Hook Ordering Matters**: When callbacks reference hooks, ensure proper initialization order
2. **Refs vs Direct Access**: Use callback refs when functions need to be available in callbacks
3. **Entity Lifecycle**: Always set destroyed objects to null to prevent accessing invalid state
4. **React Rules**: Never access `.current` during render - only in effects and event handlers
5. **Testing After Refactoring**: Always test core functionality after major architectural changes

---

**Date:** December 26, 2025
**Total Bugs Fixed:** 5
**Lines of Code Changed:** ~150
**Status:** ✅ All systems operational


