<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\TalkHistoryController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {

    $thc = new TalkHistoryController();

    return view('welcome', ['ngWords' => $thc->getNgWords()]);
});

// トーク履歴登録
Route::get('/store', [TalkHistoryController::class, 'store']);
Route::post('store', [TalkHistoryController::class, 'store']);

// トーク履歴取得
Route::get('/restore', [TalkHistoryController::class, 'restore']);
Route::post('/restore', [TalkHistoryController::class, 'restore']);

// トーク履歴削除
Route::get('/delete', [TalkHistoryController::class, 'delete']);
Route::post('/delete', [TalkHistoryController::class, 'delete']);

// トーク履歴削除
Route::get('/outputFile', [TalkHistoryController::class, 'outputFile']);
Route::post('/outputFile', [TalkHistoryController::class, 'outputFile']);


