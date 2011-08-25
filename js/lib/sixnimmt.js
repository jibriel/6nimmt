// 数字からカードを作成
function newCard(number) {
  var card = new Object();
  
  // カード番号
  card.number = number;
  
  // 得点を取得
  card.getPoint = function(){
    var num = card.number;
    var digit1 = num.charAt(num.length - 1);	// 1の位の数字
    if (num.length > 1) {
      var digit2 = num.charAt(num.length - 2);	// 10の位の数字
    }
    else{
      var digit2 = null;
    }

    if (num == 55)
      return 7;
    else if (digit1 === digit2)
      return 5;
    else if (digit1 === '0')
      return 3;
    else if (digit1 === '5')
      return 2;
    else
      return 1;
  }
  
  return card;
}

// デッキを作成
// ex. var deck = newDeck();
function newDeck() {
  var deck = new Object();
  
  var deckNums = new Array();	// '01'～'104'までの文字列を格納する配列
  
  deckNums.remove = function(index)  {	// 配列要素削除メソッドを追加
    deckNums.splice(index, 1);
  }
  // '01'～'104'までの文字列を格納
  for(var i=1; i<105; i++) {
    if (i < 10) {
	  deckNums.push('0' + i);
	}
	else {
	  deckNums.push('' + i);
	}
  }
  
  // デッキの残り枚数を取得
  deck.getRemainingNumber = function() {
    return deckNums.length;
  }
  
  // デッキからランダムにカードを取得
  deck.getCardRondomly = function () {
    if (deckNums.length === 0)
	  return null;
	
    var index = Math.floor(Math.random()*deckNums.length);
    var card = newCard(deckNums[index]);
	deckNums.remove(index);
	return card;
  }
  
  return deck;
}

// カード配列オブジェトを生成
// Arrayを継承して、拡張したもの。
function newCardArray() {
  var cardArray = new Array();

  // 指定要素を削除する
  // ex. cards.remove(0); // 一枚目を削除
  cardArray.remove = function(index)  {
    cardArray.splice(index, 1);
  }
  
  // 配列の末尾の要素を取得する
  cardArray.last = function() {
    if (cardArray.length > 0)
	  return cardArray[cardArray.length - 1];
	else
	  return null;
  }
  
  // 配列のカード得点の合計を取得する
  cardArray.getPoint = function() {
    var point = 0;
	for(var i=0; i< cardArray.length; i++) {
	  point = point + cardArray[i].getPoint();
	}
	
	return point;
  }
  
  // カードの数値に従ってソートする
  cardArray.sortCards = function() {
    cardArray.sort(function(left, right) {
	  return Number(left.number) - Number(right.number);
	});
	
	return cardArray;
  }

  return cardArray;
}

// デッキから手札を作成
// Arrayを継承しているので、length()などがそのまま利用できる。
// cardクラスにプレイヤーへの参照を追加する。
function newHands(deck, player) {
  var hands = newCardArray();
  
  hands.deck = deck;
  
  // 10枚
  for(var i=0; i < 10; i++) {
    var card = deck.getCardRondomly();
	card.player = player;
    hands.push(card);
  }
  
  hands.sortCards();
  
  return hands;
}

// デッキからプレイヤーを作成
function newPlayer(deck) {
  var player = new Object();
  
  // 手札
  player.hands = newHands(deck, player);
  
  // 得点
  player.point = 0;
  
  return player;
}

// デッキから場のカード置き場を生成
function newField(deck) {
  var field = new Object();
  field.deck = deck;
  
  // カード列
  // ex. assert(field.columns[0][0].number); 一列目の一枚目のカード番号を表示
  field.columns = new Array(newCardArray(),
  							newCardArray(),
							newCardArray(),
							newCardArray());
  field.columns[0].push(deck.getCardRondomly());
  field.columns[1].push(deck.getCardRondomly());
  field.columns[2].push(deck.getCardRondomly());
  field.columns[3].push(deck.getCardRondomly());
  
  // 場に出ている4列の先頭にあるカードを取得
  field.getTopCards = function() {
    topCards = newCardArray();
	topCards.push(field.columns[0].last());
	topCards.push(field.columns[1].last());
	topCards.push(field.columns[2].last());
	topCards.push(field.columns[3].last());
	
	return topCards;
  }
  
  // 場に出ている先頭のカードのうち、もっとも小さいものを取得
  field.getMinOfTopCards = function() {
    var topCards = field.getTopCards();
	topCards.sortCards();
	return topCards[0];
  }
  
  // 場に出ている先頭のカードの中から、該当するカードが存在する列インデックスを探す
  field.findColIndexInTopCards = function(card) {
    for(var i=0; i< field.columns.length; i++) {
	  if (field.columns[i].last().number == card.number)
	    return i;
	}
	return null;
  }
  
  // 場に出ている先頭のカードのうち、もっとも小さいものの列インデックスを取得
  field.getColIndexOfMinOfTopCards = function() {
    var minCard = field.getMinOfTopCards();
	return field.findColIndexInTopCards(minCard);
  }
  
  // カード(CardArray)を場に配置
  // ex. 
  field.pushCards = function (cards) {
    cards.sortCards();
    for(var i = 0; i < cards.length; i++) {
      var currentCard = cards[i];
      var index = field.findColIndexForPushCard(currentCard);

      if (index !== null) {
        // 配置するカードが6枚目なら爆発
        if (field.columns[index].length === 5) {
          field.BurstColumn(index, currentCard);
          field.resetColumn(index, currentCard);
        }
        else {
          field.columns[index].push(currentCard);
        }
      }
      // 場にでているどのカードよりも若ければ、列入れ替え
      else {
        var index = field.getColIndexOfMinOfTopCards();
        field.BurstColumn(index, currentCard);
        field.resetColumn(index, currentCard);
      }
    }
  }
  
  // カードの設置先列インデックスを取得
  field.findColIndexForPushCard = function (curCard) {
    // どの列の先頭カードより番号が上
	if (Number(curCard.number) > Number(field.getMinOfTopCards().number)) {
	    topCards = field.getTopCards();
		topCards.sortCards().reverse(); // 数が上のカードから調べていく
		
		for (var e = 0; e < topCards.length; e++) {
		  if (Number(curCard.number) > Number(topCards[e].number)) {
		    return field.findColIndexInTopCards(topCards[e]);
		  }
		}
    }
	else {
	  return null;
	}
  }
  
  // カード列入れ替え
  field.resetColumn = function (index, curCard) {
    field.columns[index] = newCardArray();
    field.columns[index].push(curCard);
  }
  
  // 列爆発
  field.BurstColumn = function(colIndex, card) {
    field.onBurstColumn(colIndex, card);
	card.player.point += field.columns[colIndex].getPoint();
  }
  
  // 列爆発イベント
  field.onBurstColumn = function(colIndex, card) {};

  return field;
}

