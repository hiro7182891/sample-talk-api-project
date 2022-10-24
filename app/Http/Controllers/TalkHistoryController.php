<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TalkHistoryController extends Controller
{

    // トーク内容の登録処理
    public function store(Request $request) {

        // 実行結果
        $result = array();

        // ユーザーとBotのメッセージ取得
        $um = $request->get("usrMsg");
        $bm = $request->get("botMsg");

        // 最新データの取得
        $latestData = \DB::table('tr_talk_history')->
        orderByRaw('id DESC')->
        first();

        // 登録データ
        if($latestData != null) {
            $ud = ['id' => $latestData->id +1, 'talk' => $um, 'date' => date('Y-m-d H:i:s'), 'usr_flg' => 0, 'tark_id' => $latestData->tark_id +1];
            $bd = ['id' => $latestData->id +2, 'talk' => $bm, 'date' => date('Y-m-d H:i:s'), 'usr_flg' => 1, 'tark_id' => $latestData->tark_id +1];
        }else {
            $ud = ['id' => 1, 'talk' => $um, 'date' => date('Y-m-d H:i:s'), 'usr_flg' => 0, 'tark_id' => 0];
            $bd = ['id' => 2, 'talk' => $bm, 'date' => date('Y-m-d H:i:s'), 'usr_flg' => 1, 'tark_id' => 0];
        }

        // 登録
        \DB::table('tr_talk_history')->insert($ud);
        \DB::table('tr_talk_history')->insert($bd);

        // オススメのサービスがあるかのチェック
        $interestData = \DB::table('mt_interest_word')->
            where([
                ['word', "LIKE", "%".$um."%"],
            ])->
            get();

        // サービスが存在する場合はサービス情報を取得する
        if(!$interestData->isEmpty()) {

            $recommendedService = \DB::table('mt_external_service')->
            where([
                ['id', "=", $interestData[0]->service_id],
            ])->
            get();

            $result = array_merge($result, array("recommendedService" => $recommendedService));
        }

        return $result;
    }

    // トーク内容の取得
    public function restore(Request $request) {

        $sort = $request->get("sort");
        $keyword = $request->get("keyword");

        $historyData;

        // 登録されているデータを取得
        if ($this->checkEmptyStr($keyword)) {
            $historyData = \DB::table('tr_talk_history')->
            where([
                ['talk', "LIKE", "%".$keyword."%"],
            ])->
            orderByRaw('date '.$sort)->
            orderByRaw('usr_flg '.$this->convertSort($sort))->
            get();

        } else {
            $historyData = \DB::table('tr_talk_history')->
            orderByRaw('date '.$sort)->
            orderByRaw('usr_flg '.$this->convertSort($sort))->
            get();
        }

        return $historyData;
    }

    // ユーザーの順番は日時ソート順と逆順にしたいので変換する
    private function convertSort($sort) {
        if($sort === "DESC") {
            return "DESC";
        }
        return "ASC";
    }

    // 空文字チェック 0は空としない
    private function checkEmptyStr($str) {
        
        // 0の場合はtrueで返す
        if($str == "0") {
            return true;
        }

        if(empty($str)) {
            return false;
        }

        return true;
    }

    // トーク内容の削除
    public function delete(Request $request) {

        $deleted = \DB::table('tr_talk_history')->delete();

        return "delete";
    }

    // トーク内容のファイル出力
    public function outputFile(Request $request) {

        // 出力先取得
        $filename = $this->getOutputFileName();
        
        // ファイルに書き込む内容
        $data = \DB::table('tr_talk_history')
        ->where([
                ['date', ">", $request->get("fromDate")." 00:00:00"],
                ['date', "<", $request->get("toDate")." 23:59:59"],
            ])
        ->orderByRaw('id ASC')
        ->get();
        
        $fileContent = "";

        foreach ( $data as $d ) {
            
            $date = $fileContent.$d->date; // 日付
            $talk = $d->talk; // トーク内容
            $usrFlg = $this->getUsrFlg($d->usr_flg); // ユーザー種別

            // 出力内容追加
            $fileContent = $date.",".$talk.",".$usrFlg."\n";
        }

        // ファイル書込
        file_put_contents($filename, $fileContent, LOCK_EX);

        // return "outputFile";
        return $filename;
    }

    // ファイル出力先生成
    private function getOutputFileName() {

        // 出力先パスを取得
        $path = \DB::table('mt_param')
        ->where([['name', '=', 'OUTPUT_FILE_PATH']])
        ->first();

        // ファイル名
        $nm = "talk-".date('YmdHis').".txt";

        // ファイル名とパスを結合した結果を返す
        return $path->value.$nm;
    }

    // ユーザー種別フラグから種別を取得
    private function getUsrFlg(int $usrFlg) {
        if($usrFlg == 1) {
            return "Bot";
        }
        return "ユーザー";
    }

    // 禁止用語取得
    public function getNgWords() {

        return $ngWords = \DB::table('mt_ng_words')->get();
    }

}
