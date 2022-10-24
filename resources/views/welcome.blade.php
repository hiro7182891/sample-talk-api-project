<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        
        <title>Talk Api</title>
        
        <!-- JQeury CDN -->
        <script src="https://code.jquery.com/jquery-3.6.1.js" integrity="sha256-3zlB5s2uwoUzrXK3BT7AX3FyvojsraNFxCc2vC/7pNI=" crossorigin="anonymous"></script>
        <!-- <script src="https://code.jquery.com/jquery-2.2.4.js" integrity="sha256-iT6Q9iMJYuQiMWNd9lDyBUStIq/8PuOW33aOqmvFpqI=" crossorigin="anonymous"></script> -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.min.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
        
        <!-- semantic.css  -->
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css">
        <!-- semantic.js  -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js"></script>
        
        <!-- Styles -->
        <link rel="stylesheet" href="{{asset('/assets/css/talk.css')}}">
        <!-- Script -->
        <script src="{{asset('/assets/js/talk.js')}}"></script>

    </head>

    <!-- JSでも使用できるように定義 -->
    <script>
        window.Laravel = {};
        window.Laravel.ngWords = @json($ngWords);
    </script>

    <body>

        <div id="dimmerWrapper" class="ui segment">
             <!-- ローディング -->
            <div class="ui dimmer" id="dimmer">
                <div class="ui massive text loader">Loading</div>
            </div>

            <header>
                <div class="ui text container">
                    <h1>Talk API</h1>
                </div>
            </header>
            
            <main>

                <div class="ui text container">

                    <div id="icons">
                        <div class="ui small basic icon buttons">
                            <button id="reset-btn" class="ui button"><i class="trash alternate icon"></i></button>
                            <button id="download-btn" class="ui button"><i class="download icon"></i></button>
                            <button id="filter-btn" class="ui button"><i class="filter icon"></i></button>
                            <button id="fontsize-change-btn" class="ui button"><i class="font icon"></i></button>
                        </div>
                    </div>

                    <div id="filter">
                    </div>

                    <!-- Chat表示エリア -->
                    <div id="chat-area"></div>

                    <!-- メッセージの入力とボタン配置 -->
                    <div id="text-area">

                        <div id="message-input" class="ui action input">
                            <input id="message" type="text" placeholder="メッセージを入力してください">
                            <button id="message-btn" class="ui primary button">▶</button>
                        </div>

                    </div>

                </div>

            </main>

            <footer>

            </footer>

            <!-- ↓モーダル↓ -->
            <div id="period-setting" class="ui tiny modal">
                <div class="header">ファイル出力期間設定</div>
                <div class="content">
                    <!-- content -->
                    <div id="fromDWrapper" class="ui icon right labeled input">
                        <label class="ui label">開始日</label>
                        <input id="from-date" class="datepicker" type="text" disabled>
                    </div>
                    <div id="toDWrapper" class="ui icon right labeled  input">
                        <label class="ui label">終了日</label>
                        <input id="to-date" class="datepicker" type="text" disabled>
                    </div>
                </div>
                <div class="actions">
                    <div id="output-btn" class="ui approve primary button">出力</div>
                    <div id="output-cancel-btn" class="ui cancel button">キャンセル</div>
                </div>
            </div>
            <!-- ↑モーダル↑ -->

            <!-- ↓モーダル↓ -->
            <div id="filter-setting" class="ui tiny modal">
                <div class="header">検索条件設定</div>
                <div class="content">
                    
                    <!-- content -->
                    <table class="ui celled table">
                        <tbody>
                            <tr>
                                <td>日時</td>
                                <td>
                                <div class="ui form">
                                    <div class="inline fields">
                                        <div class="field">
                                        <div class="ui radio checkbox">
                                            <input type="radio" name="sort" value="ASC" checked>
                                            <label>昇順</label>
                                        </div>
                                        </div>
                                    </div>
                                    <div class="inline fields">
                                        <div class="field">
                                        <div class="ui radio checkbox">
                                            <input type="radio" value="DESC" name="sort">
                                            <label>降順</label>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                </td>
                            </tr>
                            <tr>
                                <td>フリーワード</td>
                                <td>
                                    <div id="keyword-wrapper" class="ui input">
                                        <input id="keyword" type="text" placeholder="キーワードを入力してください">
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                <div class="actions">
                    <div id="search-btn" class="ui approve primary button">検索</div>
                    <div id="search-cancel-btn" class="ui cancel button">キャンセル</div>
                </div>
            </div>
            <!-- ↑モーダル↑ -->

            <!-- ↓モーダル↓ -->
            <div id="recommended" class="ui basic modal">
                <div class="header">Recommended service</div>
                <div class="content">
                    <!-- content -->
                    <div id="recommended-content-wrapper"></div>
                </div>
                <div class="actions">
                    <div class="ui cancel button">キャンセル</div>
                </div>
            </div>
            <!-- ↑モーダル↑ -->

            <!-- ↓モーダル↓ -->
            <div id="nm_word_modal" class="ui mini modal">
                <div class="header">使用できない単語が含まれています</div>
                <div class="content">
                    <!-- content -->
                    <p>以下の理由で 「<span id="ngword"></span>」は使用できません。</p>
                    <p id="ngword-content-wrapper"></p>
                </div>
                <div class="actions">
                    <div id="transitionPage" class="ui approve primary button">確認する</div>
                </div>
            </div>
            <!-- ↑モーダル↑ -->

            <!-- ↓モーダル↓ -->
            <div id="fontsize-change-setting" class="ui mini modal">
                <div class="header">フォントサイズ設定</div>
                <div class="content">
                    <!-- content -->
                    <div id="fontsize-change-content" class="ui icon right labeled input">
                        <input id="font-size" class="numberCheck" type="text" placeholder="" autocomplete="off">
                        <label class="ui label"> px </label>
                    </div>
                </div>
                <div class="actions">
                    <div id="change-btn" class="ui approve primary button">変更</div>
                    <div id="font-size-change-cancel-btn" class="ui cancel button">キャンセル</div>
                </div>
            </div>
            <!-- ↑モーダル↑ -->

        </div>
    </body>
</html>
