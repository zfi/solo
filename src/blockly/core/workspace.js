/*
 *   TERMS OF USE: MIT License
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 */

/**
 * @fileoverview Object representing a workspace.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Workspace');

goog.require('goog.math');


/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @constructor
 */
Blockly.Workspace = function() {
  /**
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.topBlocks_ = [];
};

/**
 * Workspaces may be headless.
 * @type {boolean} True if visible.  False if headless.
 */
Blockly.Workspace.prototype.rendered = false;

/**
 * Maximum number of blocks allowed in this workspace.
 * @type number
 */
Blockly.Workspace.prototype.maxBlocks = Infinity;

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Workspace.prototype.dispose = function() {
  this.clear();
};

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias (reversed in RTL).  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
Blockly.Workspace.SCAN_ANGLE = 3;

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.addTopBlock = function(block) {
  this.topBlocks_.push(block);
  this.fireChangeEvent();
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.removeTopBlock = function(block) {
  var found = false;
  for (var child, i = 0; child = this.topBlocks_[i]; i++) {
    if (child == block) {
      this.topBlocks_.splice(i, 1);
      found = true;
      break;
    }
  }
  if (!found) {
    throw 'Block not present in workspace\'s list of top-most blocks.';
  }
  this.fireChangeEvent();
};

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} The top-level block objects.
 */
Blockly.Workspace.prototype.getTopBlocks = function(ordered) {
  // Copy the topBlocks_ list.
  var blocks = [].concat(this.topBlocks_);
  if (ordered && blocks.length > 1) {
    var offset = Math.sin(goog.math.toRadians(Blockly.Workspace.SCAN_ANGLE));
    if (Blockly.RTL) {
      offset *= -1;
    }
    blocks.sort(function(a, b) {
      var aXY = a.getRelativeToSurfaceXY();
      var bXY = b.getRelativeToSurfaceXY();
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x);
    });
  }
  return blocks;
};

/**
 * Find all blocks in workspace.  No particular order.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Workspace.prototype.getAllBlocks = function() {
  var blocks = this.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    blocks.push.apply(blocks, blocks[i].getChildren());
  }
  return blocks;
};

/**
 * Dispose of all blocks in workspace.
 */
Blockly.Workspace.prototype.clear = function() {
  while (this.topBlocks_.length) {
    this.topBlocks_[0].dispose();
  }
};

/**
 * Returns the horizontal offset of the workspace.
 * Intended for LTR/RTL compatibility in XML.
 * Not relevant for a headless workspace.
 * @return {number} Width.
 */
Blockly.Workspace.prototype.getWidth = function() {
  return 0;
};

/**
 * Finds the block with the specified ID in this workspace.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The matching block, or null if not found.
 */
Blockly.Workspace.prototype.getBlockById = function(id) {
  // If this O(n) function fails to scale well, maintain a hash table of IDs.
  var blocks = this.getAllBlocks();
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.id == id) {
      return block;
    }
  }
  return null;
};

/**
 * The number of blocks that may be added to the workspace before reaching
 *     the maxBlocks.
 * @return {number} Number of blocks left.
 */
Blockly.Workspace.prototype.remainingCapacity = function() {
  if (this.maxBlocks == Infinity) {
    return Infinity;
  }
  return this.maxBlocks - this.getAllBlocks().length;
};

/**
 * Something on this workspace has changed.
 */
Blockly.Workspace.prototype.fireChangeEvent = function() {
  // NOP.
};