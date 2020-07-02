---
templateKey: blog-post
title: 【android】FragmentでBackボタンを押した際のイベントを簡単に制御する
date: 2020-07-02T00:29:16.019Z
description: ---
featuredpost: true
featuredimage: /img/android_eyecatch.jpg
tags:
  - android
---


とあるアプリを作成しているときにバックボタンを無効化する処理を入れたかったので、その備忘録です。

# 概要
- ActivityだったらOnBackPressedを以下のようにオーバーライドするだけでOKだが、fragmentではそうもいかない

```java:title=MyActivity.java
    @Override
    public void onBackPressed() {
      // バックボタンが押された際の処理を入れる
    }
```
- Interface経由で値を渡すこともできるけど、IDとかタグの指定をするのも面倒。。。
- もっと簡単な方法を探っていたところ、OnBackPressedDispatcherを使えばFragment内だけで実装可能のようです
（最初からドキュメント見てれば一番早かった。。。）
- https://developer.android.com/guide/navigation/navigation-custom-back

# 方法

```java:title=MyFragment.java
public class MyFragment extends Fragment {
    private OnBackPressedCallback mBackButtonCallback;

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {

        mBackButtonCallback = new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                // バックボタンが押された際の処理を入れる
            }
        };
        requireActivity().getOnBackPressedDispatcher().addCallback(this, mBackButtonCallback);
    }

    @Override
    public void onDestroy(){
        mBackButtonCallback.remove();
        super.onDestroy();
    }
}
```

# 備考
- 非常に楽なんですが、これを実装する際はonDestroyなどでremove()して明示的にコールバックを解放しないと、他のFragmentなどでも処理が実行されてしまいます。
- 勝手に解放してくれるわけではないので、その点だけ注意が必要かと思います。