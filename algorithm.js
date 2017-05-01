/**
 * AI 算法类
 * @param row 棋盘的大小
 * @constructor 初始化 AI 算法类
 */
function Algorithm(row) {
	this.blankBoard = [];
	this.blackBoard = [];
	this.whiteBoard = [];
	this.weightTable = {
		/**
		 * 权重表
		 * - 我方将要拥有的棋子数量
		 * + 对方将要拥有的棋子数量
		 */
		'2-': 10,
		'2+': 1000,
		'3-': 1500,
		'3+': 10000,
		'4-': 15000,
		'4+': 100000,
		'5-': 900000,
		'5+': 1000000
	};

	/**
	 * 初始化参数
	 */
	(function() {
		var i, j, key;
		for (i = 0; i < row; i++) {
			for (j = 0; j < row; j++) {
				key = i + '_' + j;
				this.blankBoard[key] = {
					x: i,
					y: j
				};
			}
		}
	}).bind(this)();

	/**
	 * AI 下棋的坐标
	 * @returns {*} 返回一个坐标对象
	 */
	this.start = function() {
		var badIndex, goodIndex; // 拦截棋位置，优势棋位置
		var badNum = -1, // 威胁数值，优势数值
			goodNum = -1;
		var	black = this.blackBoard, //黑棋和白棋对象
			white = this.whiteBoard;

        //求出需拦截的位置和优势的位置
		for (var blank in this.blankBoard) {
			var x = this.blankBoard[blank].x,
				y = this.blankBoard[blank].y;
			var bad = this.evaluate(x, y, black, white);
			if (bad > badNum) {
				badNum = bad;
				badIndex = blank;
			}

			var good = this.evaluate(x, y, white, black);
			if (good > goodNum) {
				goodNum = good;
				goodIndex = blank;
			}
		}

		//判断是否需要拦截
		if (goodNum > badNum) {
			return this.blankBoard[goodIndex];
		} else {
			return this.blankBoard[badIndex];
		}
	};

	/**
	 * 坐标合成字符串
	 * @param x 坐标 x
	 * @param y 坐标 y
	 * @returns {string} 返回一个字符串 x_y
	 */
	this.coordsToString = function(x, y) {
		return x + '_' + y;
	};

	/**
	 * AI 胜率评估
	 * @param posX 空白位置的 x 轴
	 * @param posY 空白位置的 y 轴
	 * @param other 对方棋子
	 * @param we 我方棋子
	 * @returns {number} 胜率指数
	 */
	this.evaluate = function(posX, posY, other, we) {
		//威胁权重
        var table = {
            '2-': 0,
            '2+': 0,
            '3-': 0,
            '3+': 0,
            '4-': 0,
            '4+': 0,
            '5-': 0,
            '5+': 0
        };
        var x = posX, y = posY,
            horizon = 1,
            vertical = 1,
            slash = 1,
            backslash = 1;

        //判断对方横坐标所有棋子
        while (other[this.coordsToString(x, y + 1)]) {
            horizon++;
            y++;
        }
        x = posX;
        y = posY;
        while (other[this.coordsToString(x, y - 1)]) {
            horizon++;
            y--;
        }
        //我方棋子的统计
        if (we[this.coordsToString(x, y + 1)] || we[this.coordsToString(x, y - 1)]) {
            table[horizon + '-']++;
        } else {
            table[horizon + '+']++;
        }
        x = posX;
        y = posY;
        //判断对方竖坐标所有棋子
        while (other[this.coordsToString(x + 1, y)]) {
            vertical++;
            x++;
        }
        x = posX;
        y = posY;
        while (other[this.coordsToString(x - 1, y)]) {
            vertical++;
            x--;
        }
        if (we[this.coordsToString(x + 1, y)] || we[this.coordsToString(x - 1, y)]) {
            table[vertical + '-']++;
        } else {
            table[vertical + '+']++;
        }
        x = posX;
        y = posY;
        //判断对方斜线坐标所有棋子
        while (other[this.coordsToString(x + 1, y + 1)]) {
            slash++;
            x++;
            y++;
        }
        x = posX;
        y = posY;
        while (other[this.coordsToString(x - 1, y - 1)]) {
            slash++;
            x--;
            y--;
        }
        if (we[this.coordsToString(x + 1, y + 1)] || we[this.coordsToString(x - 1, y - 1)]) {
            table[slash + '-']++;
        } else {
            table[slash + '+']++;
        }
        x = posX;
        y = posY;
        //判断对方反斜线坐标所有棋子
        while (other[this.coordsToString(x + 1, y - 1)]) {
            backslash++;
            x++;
            y--;
        }
        x = posX;
        y = posY;
        while (other[this.coordsToString(x - 1, y + 1)]) {
            backslash++;
            x--;
            y++;
        }

        if (we[this.coordsToString(x + 1, y - 1)] || we[this.coordsToString(x - 1, y + 1)]) {
            table[backslash + '-']++;
        } else {
            table[backslash + '+']++;
        }

        delete table['1+'];
        delete table['1-'];

        //求出权重值
        var score = 0;
        for (var key in table) {
            score += this.weightTable[key] * table[key];
        }

		return score;
	};

	/**
	 * 判断胜负
	 * @param we 指定需要判断的角色，true 是自己，false 是 AI
	 * @param posX 棋子的 x 轴
	 * @param posY 棋子的 y 轴
	 * @returns {boolean} 判断是否可以连成 5 个棋子
	 */
	this.isWinner = function(we, posX, posY) {
		posX = Number(posX);
		posY = Number(posY);

		var index = this.coordsToString(posX, posY);
		var role = null;
		var data = {
			x: posX,
			y: posY
		};
		delete this.blankBoard[index];

		//判断角色
		if (we) {
			role = this.blackBoard;
			role[index] = data;
		} else {
			role = this.whiteBoard;
			role[index] = data;
		}
		
		
		var x = posX, y = posY,
			horizon = 1,
			vertical = 1,
			slash = 1,
			backslash = 1;

		while (role[this.coordsToString(x, y + 1)]) {
			horizon++;
			y++;
		}
		x = posX;
		y = posY;
		while (role[this.coordsToString(x, y - 1)]) {
			horizon++;
			y--;
		}
		x = posX;
		y = posY;
		while (role[this.coordsToString(x + 1, y)]) {
			vertical++;
			x++;
		}
		x = posX;
		y = posY;
		while (role[this.coordsToString(x - 1, y)]) {
			vertical++;
			x--;
		}
		x = posX;
		y = posY;
		while (role[this.coordsToString(x + 1, y + 1)]) {
			slash++;
			x++;
			y++;
		}
		x = posX;
		y = posY;
		while (role[this.coordsToString(x - 1, y - 1)]) {
			slash++;
			x--;
			y--;
		}
		x = posX;
		y = posY;
		while (role[this.coordsToString(x + 1, y - 1)]) {
			backslash++;
			x++;
			y--;
		}
		x = posX;
		y = posY;
		while (role[this.coordsToString(x - 1, y + 1)]) {
			backslash++;
			x--;
			y++;
		}

		return Math.max(horizon, vertical, slash, backslash) >= 5;
	};
}