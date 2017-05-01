(function () {

    /**
     * 五子棋类
     * @param elem 根节点
     * @param options 配置对象
     * @param AI AI 对象
     * @constructor 初始化各项参数并开始绘制棋盘
     */
    function FiveLineChess(elem, options, AI) {
        var ctx = {
            root: elem || null,
            width: options.width || '450',
            height: options.height || '450',
            row: options.row || 15
        };

        this.run(ctx, AI);
    }

    FiveLineChess.prototype = {
        AI: {}, //AI算法
        OVER_FLAG: false, //是否结束游戏
        root: '', //根节点
        canvasElem: '', //棋盘 dom 元素
        canvasObj: '', //棋盘对象
        ROW: 0, //棋盘大小
        OFFSET: 0,	//偏移量
        OFFSET_MAX: 0, //最大偏移量
        BOX_SIZE: 0, //格子大小
        ME_FLAG: true,
        chessBoard: [], //下棋记录

        /**
         * 初始化各项参数
         * @param ctx 配置对象
         * @param AI AI 对象
         * @returns {boolean} false 强制结束
         */
        run: function (ctx, AI) {
            if (!ctx.root) {
                console.log('必须要有一个容器！');
                return false;
            }

            this.ROW = ctx.row;
            this.OFFSET = 15;
            this.OFFSET_MAX = 450 - this.OFFSET;
            this.BOX_SIZE = 30;

            //初始化棋盘记录
            for (var i = 0; i < this.ROW; i++) {
                this.chessBoard[i] = [];
                for (var j = 0; j < this.ROW; j++) {
                    this.chessBoard[i][j] = 0;
                }
            }

            this.root = document.getElementById(ctx.root);
            this.canvasElem = document.createElement('canvas');
            this.canvasElem.width = ctx.width;
            this.canvasElem.height = ctx.height;
            this.canvasObj = this.canvasElem.getContext('2d');
            this.root.append(this.canvasElem);
            this.drawCanvas();
            this.canvasElem.addEventListener('click', this.handleClick.bind(this));
            this.AI = AI;
        },

        /**
         * 绘制棋盘 14 * 14 格子
         */
        drawCanvas: function () {
            this.canvasObj.beginPath();
            for (var i = 0; i < this.OFFSET; i++) {
                this.canvasObj.moveTo(i * this.BOX_SIZE + this.OFFSET, this.OFFSET);
                this.canvasObj.lineTo(i * this.BOX_SIZE + this.OFFSET, this.OFFSET_MAX);
                this.canvasObj.stroke();
                this.canvasObj.moveTo(this.OFFSET, i * this.BOX_SIZE + this.OFFSET);
                this.canvasObj.lineTo(this.OFFSET_MAX, i * this.BOX_SIZE + this.OFFSET);
                this.canvasObj.stroke();
            }
        },

        /**
         * 绘制棋子
         * @param x 棋子的 x 坐标
         * @param y 棋子的 y 坐标
         * @param isMe 指定需要判断的角色，true 是自己，false 是 AI
         */
        drawChess: function (x, y, isMe) {
            var arcX = this.OFFSET + x * this.BOX_SIZE + 2,
                arcY = this.OFFSET + y * this.BOX_SIZE - 2,
                radius = 13,
                startAngle = 0,
                endAngle = Math.PI * 2;

            this.canvasObj.beginPath();
            this.canvasObj.arc(arcX, arcY, radius, startAngle, endAngle);
            this.canvasObj.closePath();

            var x0 = arcX + 2,
                y0 = arcY - 2,
                r0 = 13,
                x1 = arcX + 2,
                y1 = arcY - 2,
                r1 = 0;
            //定义渐变对象
            var gradient = this.canvasObj.createRadialGradient(x0, y0, r0, x1, y1, r1);

            if (isMe) {
                gradient.addColorStop(0, '#0A0A0A');
                gradient.addColorStop(1, '#636766');

            } else {
                gradient.addColorStop(0, '#D1D1D1');
                gradient.addColorStop(1, '#F9F9F9');
            }

            this.canvasObj.fillStyle = gradient;
            this.canvasObj.fill();

            //判断胜负
            if (this.AI.isWinner(isMe, x, y)) {
                this.OVER_FLAG = true;
                this.drawText(isMe);
            }
        },

        /**
         * 绘制游戏结束后的文本
         * @param isMe 指定需要判断的角色，true 是自己，false 是 AI
         */
        drawText: function (isMe) {
            var role = isMe ? '玩家' : '电脑';
            var initHeight = 40;
            var x = this.canvasElem.width / 2,
                y = this.canvasElem.height / 2,
                w = this.canvasElem.width,
                h = this.canvasElem.height;

            this.canvasObj.fillStyle = 'rgba(255,255,255,0.5)';
            this.canvasObj.fillRect(0, 0, w, h);
            this.canvasObj.font = '36px serif';
            this.canvasObj.textBaseline = 'middle';
            this.canvasObj.textAlign = 'center';
            this.canvasObj.fillStyle = '#c00';
            this.canvasObj.fillText('恭喜 ' + role + ' 取得胜利!', x, y);
            this.canvasObj.fillText('重新开始游戏', x, y + initHeight);
        },

        /**
         * 清空棋盘，重新绘制
         */
        clear: function () {
            this.OVER_FLAG = false;
            this.canvasObj.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);
            this.drawCanvas();
            for (var i = 0; i < this.OFFSET; i++) {
                this.chessBoard[i] = [];
                for (var j = 0; j < this.OFFSET; j++) {
                    this.chessBoard[i][j] = 0;
                }
            }
        },

        /**
         * 下棋事件
         * @param e 事件对象
         * @returns {boolean} false 强制结束
         */
        handleClick: function (e) {
            e.preventDefault();

            //判断是否重开游戏
            if (this.OVER_FLAG) {
                this.clear();
                return false;
            }

            var x = e.offsetX;
            var y = e.offsetY;
            var i = Math.floor(x / this.BOX_SIZE);
            var j = Math.floor(y / this.BOX_SIZE);
            var index = {};

            //下棋判断
            if (this.chessBoard[i][j] == 0) {
                this.chessBoard[i][j] = 1; //黑棋
                this.drawChess(i, j, this.ME_FLAG);
                //游戏还没结束
                if (!this.OVER_FLAG) {
                    index = this.AI.start(); //通过 AI 计算出落子位置
                    this.chessBoard[index.x][index.y] = 2; //白棋
                    this.drawChess(index.x, index.y, !this.ME_FLAG);
                }
            }
        }
    };

    window.FiveLineChess = FiveLineChess;
})();