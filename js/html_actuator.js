function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
	  if (metadata.won) {
        self.message(true); // You win!
      }
	  else if (metadata.over) {
        self.message(false); // You lose
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var text=new Array(18);
  text[0] = " ";
  text[1] = "太乙<br>神兵";
  text[2] = "慧明";
  text[3] = "金砖";
  text[4] = "灵虚";
  text[5] = "雩风";
  text[6] = "厌火";
  text[7] = "浑邪<br>之灵";
  text[8] = "安尼<br>瓦尔";
  text[9] = "明川";
  text[10] = "风琊";
  text[11] = "温留";
  text[12] = "玉怜";
  text[13] = "初七";
  text[14] = "程<br>庭钧";
  text[15] = "华月";
  text[16] = "沈夜";
  text[17] = " ";
  
  var self = this;

  var text2 = function (n) { var r = 0; while (n > 1) r++, n >>= 1; return r; }
  
  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 131072) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.innerHTML = text[text2(tile.value)];

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var mytxt=new Array(14);
  mytxt[0]="孩儿们，上！";
  mytxt[1]="血……好喝的血，快拿来……快拿来……！";
  mytxt[2]="区区凡人，也敢与我斗！";
  mytxt[3]="小龙虾果然厉害！";
  mytxt[4]="浑邪王死了都这么厉害！";
  mytxt[5]="你们这些外来者，竟敢亵渎我捐毒圣地！";
  mytxt[6]="流月城太阴祭司明川在此，尔等宵小，还不跪地相迎！";
  mytxt[7]="愿神--照亮我的归途！";
  mytxt[8]="小子，你还是太弱了！";
  mytxt[9]="来嘛，留下来陪奴奴嘛！";
  mytxt[10]="誓死保护主人！";
  mytxt[11]="我的傀儡怎么样？";
  mytxt[12]="你们休想伤害阿夜！";
  mytxt[13]="弱者的愤怒不过是几句牢骚罢了！";
  
  var text3 = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }
  var type    = won ? "game-won" : "game-over";
  var message = won ? "呵呵呵呵呵呵呵呵呵呵呵！你通关了！" : mytxt[text3(maxValue)-3];

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);
  this.sharingContainer.appendChild(this.scoreTweetButton());
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var text = "我在2048古二版中得了" + this.score + "分 , 你能得多少分？";
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "http://service.weibo.com/share/share.php?url=http://bjdc.github.io/egg&title="+text); 
  tweet.textContent = "分享到微博";

  return tweet;
};
