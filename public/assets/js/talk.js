$(function(){

    /******* 以下に変数を定義 *******/

    // トーク内容検索条件 初期値
    const terms = {sort: "ASC", keyword: ""};

    // 投稿日時判定用の配列
    const days = [];

    /****** 以下にイベントを定義 ******/

    // 初期化イベント
    init(terms);

    // 送信ボタン押下時イベント
    $(document).on("click", "#message-btn", function() {
        sendMessage();
    });

    // リセットボタン押下時イベント
    $(document).on("click", "#reset-btn", function() {
        resetMessage();
    });

    // ファイル出力ボタン押下時イベント
    $(document).on("click", "#download-btn", function() {
        // 期間設定画面を開く
        periodSetting();
    });

    // 出力ボタン押下時イベント
    $(document).on("click", "#output-btn", function() {

        const fromDate = $("#from-date");
        const toDate = $("#to-date");

        // 開始日、または終了日が入力されていない場合は処理を実行しない
        if($.isEmptyObject(fromDate.val()) || $.isEmptyObject(toDate.val())) {
            alert("開始日と終了日を入力してください。");
        }else {
            // 出力処理を実行
            outputFile(fromDate.val(), toDate.val());
        }

        // 値をリセットしておく
        fromDate.val("");
        toDate.val("");
    });


    // フィルターボタン押下時イベント
    $(document).on("click", "#filter-btn", function() {
        
        // 検索条件設定モーダル表示
        $('#filter-setting').modal('show');
    });

    // 検索条件設定
    $(document).on("click", "#search-btn", function() {
        
        // 検索条件で再検索処理
        const sort = $('input:radio[name="sort"]:checked').val();
        const keyword = $("#keyword").val();

        const terms = {sort: sort, keyword: keyword};

        // ロード開始
        $('#dimmer').dimmer('show');

        init(terms, function() {
            $("#keyword").val("");
            // ロード開始
            $('#dimmer').dimmer('hide');
        });
    });

    // フォントサイズ設定ボタン押下時イベント
    $(document).on("click", "#fontsize-change-btn", function() {
        // モーダル表示
        $("#fontsize-change-setting").modal("show");

    });

    // フォントサイズ変更ボタン押下時イベント
    $(document).on("click", "#change-btn", function() {
        // 入力値取得
        const size = $("#font-size").val();

        // 何も入力されていない場合
        if( $.isEmptyObject(size)) {
            alert("1以上の数値を入力してください。");
            resetFontSize();
            return false;
        }

        // 数値以外が入力された場合
        if(!(size.match(/[0-9]/))) {
            alert("数値以外が入力されました。");
            resetFontSize();
            return false;
        }

        // マイナスの数値が入力された場合
        if(size <= 0) {
            alert("1以上の値を入力してください。");
            resetFontSize();
            return false;
        }

        if(size != "") {
            $("body").attr("font-size", size);
            changeFontSize(size);
        }else {
            alert("フォントサイズが入力されていません。");
            resetFontSize();
        }
    });

    // フォントサイズ変更 キャンセルイベント
    $(document).on("click", "#font-size-change-cancel-btn", function() {
        resetFontSize();
    });

    // 検索条件変更 キャンセルイベント
    $(document).on("click", "#search-cancel-btn", function() {
        $('input[value="'+$("body").attr("sort")+'"]').prop('checked', true);
        $("#keyword").val("");
    });

    // 検索条件変更 キャンセルイベント
    $(document).on("click", "#output-cancel-btn", function() {
        // 値をリセットしておく
        $("#from-date").val("");
        $("#to-date").val("");
    });
    

    // 数値チェック
    // $(document).on("keydown", ".numberCheck", function(e) {
    //     let k = e.keyCode;
    //     let str = String.fromCharCode(k);
    //     if(!(str.match(/[0-9]/) || (37 <= k && k <= 40) || k === 8 || k === 46)){
    //       return false;
    //     }
    // });

    // $(document).on("keyup", ".numberCheck", function() {
    //     this.value = this.value.replace(/[^0-9]+/i,'');
    // });

    // $(document).on("blur", ".numberCheck", function() {
    //     this.value = this.value.replace(/[^0-9]+/i,'');
    // });

    /******** 以下に関数を定義 *******/

    // 初期化
    function init(terms, callBack) {

        console.info("初期化処理実行");

        $("body").attr("sort", terms.sort);

        // トーク内容の表示
        displayTalks(terms);

        if(callBack) {
            callBack();
        }
    }

    // トーク内容の表示処理
    function displayTalks(terms) {

        // 判定用配列を空に
        days.length = 0;

        restore(terms, function(talkData) {

            // チャット表示エリア初期化
            const ca = $("#chat-area");
            ca.empty();

            $.each(talkData, function(i,v) {

                // 先頭の日付追加
                const ymd = v.date.slice(0, -9);
                addDate(ymd, ca, false);

                const addFlg = getAddFlg();

                // ユーザー種別で分岐
                if (v.usr_flg == 1) {
                    addBotTalk(v.talk, 0);
                }else {
                    addUsrTalk(v.talk, 0);
                }
            });
        });
    }

    // 日時追加処理
    function addDate(ymd, target, flg) {
        // 投稿日時が新しい場合
        if(days.indexOf(ymd) < 0) {
            // 判定用配列に格納
            days.push(ymd);
            // 表示内容
            const content = $("<div class='ymd'><p>- "+ymd+" -</p></div>");
            // トークの前に追加
            const addFlg = getAddFlg();
            if(addFlg == 0) {
                target.append(content);
            }else {
                const t = target.find("div");
                // トーク内容の有無で分岐
                if (t[0] != undefined) {
                    if(flg) {
                        target.prepend(content);
                    }else {
                        $(t[t.length-1]).parent().after(content);
                    }
                 }else {
                    target.prepend(content);
                }
            }
        }
    }

    // 送信ボタン押下時の処理
    function sendMessage() {

        const msg = $("#message").val();

        // メッセージが空でなければ、TalkApiにリクエストを投げる
        if($.isEmptyObject(msg)) {
            
            alert("メッセージが入力されていません。");
            return false;

        }else {

            // 禁止用語が含まれていないかのチェック、問題なければ処理を進める
            if( checkNgWord(msg) ) {

                // 先頭の日付追加
                const today = new Date();
                const format = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
                addDate(format, $("#chat-area"), true);

                // ユーザーのメッセージをチャット欄へ表示
                const addFlg = getAddFlg();
                addUsrTalk(msg, addFlg);

                // Talk APIへのリクエストと結果の表示
                getTalkApi(msg,
                function(result) {

                    let reply;

                    if($.isEmptyObject(result.results)) {
                        // 返答の取得に失敗していた場合は {メッセージの取得に失敗しました。} を表示
                        reply = "メッセージの取得に失敗しました。";
                    }else {
                        reply = result.results[0].reply;
                    }
                    
                    // 返答の取得に失敗していた場合は {メッセージの取得に失敗しました。} を表示
                    if($.isEmptyObject(reply)) {
                        reply = "メッセージの取得に失敗しました。";
                    }

                    // BOTのメッセージをチャット欄へ表示
                    addBotTalk(reply, addFlg);

                    // DB登録処理
                    store(msg, reply, function(response) {
                        if (response.recommendedService != undefined) {

                            // 対象データ
                            const serviceInfo = response.recommendedService[0];

                            // 追加先
                            const wrapper = $("#recommended-content-wrapper");
                            wrapper.empty();

                            // 追加する要素
                            const img = $("<div class='img-wrapper'>" +
                                "<p>"+serviceInfo.service_name+"</p>" +
                                "<a href='"+serviceInfo.link+"' target='blank'>" +
                                "<img class='recommendedServiceImg' src='"+serviceInfo.img+"' width='100%'>" +
                                "</a>" +
                                "</div>");

                            wrapper.append(img);

                            // モーダル表示
                            $("#recommended").modal("show");
                        }
                    });
                    
                });
            }

            // 全ての処理が完了したら入力欄はリセット
            $("#message").val("");

            // 禁止用語チェック処理
            function checkNgWord(msg) {

                let result = true;

                $.each(Laravel.ngWords, function(i,v) {
                    if(v.word.indexOf(msg) >= 0) {
                        // モーダル表示 {使用出来ない単語が含まれているため使用出来ません。}
                        $("#nm_word_modal").modal("show");
                        // 禁止理由を表示
                        $("#ngword").append(msg);
                        $("#ngword-content-wrapper").append("・"+v.cause);

                        result = false;
                        return false;
                    }
                });

                return result;
            }
        }
    }

    // 追加順を判定
    function getAddFlg() {

        // 現在のソート順
        const st = $("body").attr("sort");

        if(st === "DESC") {
            return 1;
        }
        return 0;
    }

    // ユーザーのメッセージをチャット欄へ表示
    function addUsrTalk(msg, addFlg) {

        // チャット表示エリア
        const ca = $("#chat-area");

        // ユーザーの入力内容を作成
        const usrMsg = createMessage(msg, 0);

        if(addFlg == 0) {
            ca.append(usrMsg);
        }else {
            const target = ca.find(".ymd:first");
            target.after(usrMsg);
        }

        // フォントサイズ設定時は更新
        updateFontSize();
    }

    // BOTのメッセージをチャット欄へ表示
    function addBotTalk(reply, addFlg) {

        // チャット表示エリア
        const ca = $("#chat-area");

        // botの入力内容を作成
        const botMsg = createMessage(reply, 1);

        if(addFlg == 0) {
            ca.append(botMsg);
        }else {
            const target = ca.find(".ymd:first");
            target.after(botMsg);
        }

        // フォントサイズ設定時は更新
        updateFontSize();
    }

    // リセットボタン押下時イベント
    function resetMessage() {
        if(confirm("トーク内容をリセットしますか？\r\n※一度リセットしたトーク内容は元に戻せません。")) {

            del(function(result) {
                // チャット表示エリアもリセット
                const ca = $("#chat-area");
                ca.empty();
                
                // 判定用配列を空に変更
                days.length = 0;

                // すべて完了後にアラート表示
                alert("トーク内容をリセットしました。");
            });
        }
    }

    // ファイル出力ボタン押下時イベント
    function periodSetting() {

        // 期間設定モーダル表示
        $('#period-setting').modal('show');

        // デートピッカー初期化
        $('.datepicker').datepicker({
            dateFormat: "yy-mm-dd",
            showOn: "button",
            buttonText: "…"
        });

        // 背景色設定
        $('.datepicker').css("background", "rgba(241, 241, 241, 0.8)");
        $(".ui-datepicker-trigger")
            .css("background", "rgba(0,0,0,.5)")
            .css("border", "none")
            .css("borderRadius", "2px")
            .css("color", "#fff")
            .css("min-width", "40px")
            .css("fontWeight", "bold");
        // $(".dimmer").css("background","rgba(255,255,255,0.9)");
    }

    // Talk Apiへのリクエスト処理
    function getTalkApi(query, callBack) {
        $.ajax({
            url: "https://api.a3rt.recruit.co.jp/talk/v1/smalltalk",
            type: "POST",
            data: {
                apikey: "DZZhAKkBB7KpREIeOGoNDEThhdwspUuY",
                query: query
            }
        }).done(function(result) {
            callBack(result);
        });
    }

    // 投稿部分作成処理
    function createMessage(message, usrFlg) {

        if(usrFlg == "1") {
            return botMessage();
        }else {
            return usrMessage();
        }

        // bot
        function botMessage() {

            const wrapper = $('<div class="b-msg">');
            const icon = $('<i class="m-inline-block large user icon"></i>');
            const txt = $('<div class="m-inline-block">');
            txt.text(message);

            wrapper.append(icon);
            wrapper.append(txt);

            return wrapper;
        }

        // ユーザー
        function usrMessage() {

            const wrapper = $('<div class="u-msg">');
            const icon = $('<i class="m-inline-block large user outline icon"></i>');
            const txt = $('<div class="m-inline-block">');
            txt.text(message);

            wrapper.append(txt);
            wrapper.append(icon);

            return wrapper;
        }
    }

    // ファイルサイズ変更処理
    function updateFontSize() {
        const size = $("body").attr("font-size");
        // ユーザーがフォントサイズを設定していた場合、サイズ更新処理実行
        if(size != undefined) {
            changeFontSize(size);
        }
    }

    // ファイルサイズ変更処理
    function changeFontSize(size) {
        $("#chat-area div").css("font-size", size+"px");
    }

    // キャンセル時や警告の際に値をリセット
    function resetFontSize() {
        const size = $("body").attr("font-size");

        // サイズが設定済みの場合は設定サイズ変更
        if(size != undefined) {
            $("#font-size").val(size);
        }else {
            $("#font-size").val("");
        }
    }

    // DB取得処理
    function restore(terms, callBack) {

        $.ajax({
            url: "/restore",
            type: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
            },
            data: {
                sort: terms.sort,
                keyword: terms.keyword,
            },
        }).done(function(response) {
            callBack(response);
        });
    }

    // DB登録処理
    function store(usrMsg, botMsg, callBack) {

        $.ajax({
            url: "/store",
            type: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
            },
            data: {
                usrMsg: usrMsg,
                botMsg: botMsg
            }
        }).done(function(response) {
            callBack(response);
        });
    }

    // DB削除処理
    function del(callBack) {

        // ロード開始
        $('#dimmer').dimmer('show');

        $.ajax({
            url: "/delete",
            type: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
            },
            data: {}
        }).done(function(response) {
            callBack(response);
        }).always(function() {
            // ロード終了
            $('#dimmer').dimmer('hide');
        });
    }

    // ファイル出力処理
    function outputFile(fromDate, toDate) {

        // ロード開始
        $('#dimmer').dimmer('show');

        $.ajax({
            url: "/outputFile",
            type: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
            },
            data: {
                fromDate: fromDate,
                toDate: toDate
            },
        }).done(function(response) {
            alert("ファイルを出力しました。");
        }).always(function() {
            // ロード終了
            $('#dimmer').dimmer('hide');
        });
    }

});