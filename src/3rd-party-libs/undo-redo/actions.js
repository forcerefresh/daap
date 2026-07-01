// Based on redux-deep-diff (MIT) — https://github.com/wwilsman/redux-deep-diff
// Copyright (c) 2017 Wil Wilsman
// SPDX-License-Identifier: MIT

export const UNDO = '@@redux-deep-diff/UNDO';
export const REDO = '@@redux-deep-diff/REDO';
export const JUMP = '@@redux-deep-diff/JUMP';
export const CLEAR = '@@redux-deep-diff/CLEAR';

export const undo = () => ({ type: UNDO });
export const redo = () => ({ type: REDO });
export const jump = (index) => ({ type: JUMP, index });
export const clear = () => ({ type: CLEAR });
