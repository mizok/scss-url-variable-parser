import { parse, Stylesheet } from 'css';
import { get } from 'lodash';
import getVariableNames from './get-variable-names';
import renderValuesToCSS from './render-values-to-css';
import { formatDeep } from './utils';
import { ParseOptions } from './interface'
import {stripJsonComments} from './stripe-json-comment';

interface VarsOneLevelDeep {
  [key: string]: string;
}
interface Vars {
  [key: string]: string | VarsOneLevelDeep;
}

function removeLeadingDot(str: string): string {
  return str.replace(/^\.?/, '');
}

function removeMapTail(str: string): string {
  return str.replace(/\[is-map\]$/, '');
}

function unquote(str: string): string {
  return str.replace(/^"(.*)"$/, '$1');
}

function nameFromSelector(selector: string): string {
  const noDot = removeLeadingDot(selector);
  const name = removeMapTail(noDot);
  return name;
}

function readValues(css: string): Vars {
  const ast:Stylesheet = parse(css);

  const variables: Vars = {};

  if (!ast.stylesheet) {
    return variables;
  }

  ast.stylesheet.rules.forEach(rule => {
    const selector = get(rule, 'selectors[0]');
    const name = nameFromSelector(selector);
    const value = get(rule, 'declarations[0].value');

    // @ts-ignore: Unreachable code error
    if (selector.endsWith('[is-map]')) {
      const map: VarsOneLevelDeep = (variables[name] as VarsOneLevelDeep) || {};
      const key = get(rule, 'declarations[0].property', '');
      map[key] = unquote(value);
      variables[name] = map;
    } else {
      variables[name] = value;
    }
    
  });

  return variables;
}

export  function parseUrlVariable(
  sass: string,
  passedOptions: ParseOptions = {}
) {
  const options = { ...passedOptions };
  const variableNames = getVariableNames(sass);
  const stripedScss = stripJsonComments(sass)

  const regex = /(^\s*\$[^:]+\s*:\s.*)(,)?/gm;
  
  let match;
  const newStringArray = [];
  while ((match = regex.exec(stripedScss)) !== null) {
    const newString = match[0].trim();
    newStringArray.push(newString);
  }

  const result = newStringArray.join(';\n')+';';

  const css = renderValuesToCSS(result, variableNames, options);
  if (!css) {
    return {};
  }

  const variables = readValues(css);
  const formattedUrlObject = formatDeep(variables);
  let classPropertyContent = '';
  const urlRegex = /url\((.*?)\)/; // 正規表達式
  Object.keys(formattedUrlObject).forEach((key)=>{
	const  val= formattedUrlObject[key] as string;
	const match = val.match(urlRegex); // 執行檢查
	if (match) {
	const extracted = match[1]; // 取得匹配的部分
	classPropertyContent+=`    ${key}:${extracted};\n`
	} 
  })

  const classStr = `
class ImageLink {

${classPropertyContent}

}
  `
  return classStr;
}


const qq =parseUrlVariable(
 `
 
@forward './global-assets/v1/h5/scss/common/variables' with(

	//主色
	$primary: #14805e,

	//灰階顏色
	$color-main: #ffffff,
	$color-title: #ffffff,
	$color-text: darken(#F2F2F2, 10%),
	$color-text-l: #999999,

	//背景顏色
	$color-content-bg: #111111,
	$color-lobby-bg: #f5f5f5,

	//tab
	$bg-tab: #555555, //tab 的bg底色
	$color-tab: #333333, //tab 本身顏色
	$font-search-tab: #ffffff, //tab 字色
	$color-search-date-input-bg: #f5f5f5,

	//側選單
	$font-menu: #ffffff,

	$img-nav-second-icon-exchange: url("/assets/images/icon-set/sports-icon/icon-exchange.svg"),
	$img-nav-second-icon-sportbook: url("/assets/images/icon-set/sports-icon/icon-sportbook.svg"),
	$img-nav-second-icon-virtual: url("/assets/images/icon-set/sports-icon/icon-virtual.svg"),
	$img-nav-second-icon-kabaddi: url("/assets/images/icon-set/sports-icon/icon-kabaddi.svg"),
	$img-nav-second-icon-lottery: url("/assets/images/icon-set/sports-icon/icon-lottery.svg"),

	//卡片
	$color-card-bg: #333333,
	$color-card-icon: #FFDF1A,
	$font-hot: #FFDF1A, //slot 人氣顏色

	//首頁圖標顏色
	$color-icon-bg: #222222,

	//反轉顏色
	$color-reverse: #000000,

	//頁首顏色
	$color-header-bg: #111111,
	$color-banner-bg: #111111,
	$color-header-burger: #14805e,
	$color-header-service-text: #ffffff,
	$color-header-menu-btn: #111111,
	$svg-service: #14805e,
	$svg-logout: #14805e,


	//公告顏色
	//$img-announvement-icon: url("/assets/images/theme/red/index-announcement-icon.svg"),
	$color-announvement-bg-v1: #111111,
	$color-announvement-text-v2: #ffffff,
	$color-announvement-bg-v2: #ffffff,
	$color-announvement-border-v2: #eeeeee,
	$announvement-icon: #14805e,

	// 選單顏色
	$color-nav-bg: #111111,
	$color-nav-border-bottom: lighten(#111111, 10%),
	$color-nav-slick-current-btn: #1f2721,

	//工具列圖標
	$toolbar-border-top: #333333,
	$toolbar-bg: #111111,
	$toolbar-item-bg-active: #333333,

	//選單圖標
	$img-nav-icon-sport: url("/assets/images/icon-set/theme-icon/black/icon-sport.svg"),
	$img-nav-icon-casino: url("/assets/images/icon-set/theme-icon/black/icon-casino.svg"),
	$img-nav-icon-slot: url("/assets/images/icon-set/theme-icon/black/icon-slot.svg"),
	$img-nav-icon-card: url("/assets/images/icon-set/theme-icon/black/icon-card.svg"),
	$img-nav-icon-fish: url("/assets/images/icon-set/theme-icon/black/icon-fish.svg"),
	$img-nav-icon-esport: url("/assets/images/icon-set/theme-icon/black/icon-esport.svg"),
	$img-nav-icon-lottery: url("/assets/images/icon-set/theme-icon/black/icon-lottery.svg"),

	//會員中心
	$img-member-icon-deposit: url("/assets/images/icon-set/theme-icon/black/icon-deposit.svg"),
	$img-member-icon-withdrawal: url("/assets/images/icon-set/theme-icon/black/icon-withdrawal.svg"),
	$img-member-icon-transfer: url("/assets/images/icon-set/theme-icon/black/icon-transfer.svg"),
	$img-member-icon-total: url("/assets/images/icon-set/theme-icon/black/icon-total.svg"),
	$img-member-icon-water: url("/assets/images/icon-set/theme-icon/black/icon-water.svg"),
	$img-member-icon-wallet: url("/assets/images/icon-set/theme-icon/black/icon-wallet.svg"),
	$img-member-icon-history: url("/assets/images/icon-set/theme-icon/black/icon-history.svg"),
	$img-member-icon-account: url("/assets/images/icon-set/theme-icon/black/icon-account.svg"),
	$img-member-icon-mail: url("/assets/images/icon-set/theme-icon/black/icon-mail.svg"),
	$img-member-icon-recommendfriend: url("/assets/images/icon-set/theme-icon/black/icon-recommendfriend.svg"),
	$img-member-icon-kyc: url("/assets/images/icon-set/theme-icon/black/icon-kyc.svg"),
	$img-member-icon-setting: url("/assets/images/icon-set/theme-icon/black/icon-setting.svg"),
	$img-member-icon-phone: url("/assets/images/icon-set/theme-icon/black/icon-member-phone.svg"),
	$img-member-icon-talk: url("/assets/images/icon-set/theme-icon/black/icon-member-talk.svg"),
	$img-member-icon-promotion: url("/assets/images/icon-set/theme-icon/black/icon-member-promotion.svg"),
	$img-member-icon-resetpasswords: url("/assets/images/icon-set/theme-icon/black/icon-resetpasswords.svg"),
	$img-member-icon-biometric: url("/assets/images/icon-set/theme-icon/black/icon-biometric.svg"),
	$img-member-icon-gift: url("/assets/images/icon-set/theme-icon/black/icon-gift.svg"),
	$img-member-icon-vip: url("/assets/images/icon-set/theme-icon/black/icon-vip.svg"),
	$img-member-icon-documents: url("/assets/images/icon-set/theme-icon/black/icon-documents.svg"),
	$img-member-icon-bank: url("/assets/images/icon-set/theme-icon/black/icon-bank.svg"),
	$img-member-icon-crypto: url("/assets/images/icon-set/theme-icon/black/icon-crypto.svg"),
	$img-member-icon-e-wallets: url("/assets/images/icon-set/theme-icon/black/icon-ewallets.svg"),

	$color-member-logout: #ffffff,

	$color-member-dialog-border: #77b6a2,
	$color-member-dialog-arrow: #5ba68e,
	$color-member-header-mask-color: linear-gradient(to top, rgba(17, 17, 17, .6) 10%, rgba(17, 17, 17, 0) 100%),

	$svg-member-icon-eyes3-open: #7dbfaa,
	$svg-member-icon-eyes3-close: #7dbfaa,
	$svg-member-icon-bonuswallet: #7dbfaa,
	$svg-member-icon-refresh: #7dbfaa,

	$color-member-menu-balance-title: #7dbfaa,
	$color-member-menu-balance-text: #FFDF1A,

	// membermenu social icons
	$member-social-icon-forum: url("/assets/images/icon-set/socialicons/black/forum.svg"),

	// csicons
	$member-cs-icon-fb: url("/assets/images/icon-set/csicons/black/facebook-messenger.svg"),
	$member-cs-icon-telegram: url("/assets/images/icon-set/csicons/black/telegram.svg"),
	$member-cs-icon-line: url("/assets/images/icon-set/csicons/black/line.svg"),
	$member-cs-icon-whatsapp: url("/assets/images/icon-set/csicons/black/whatsapp.svg"),
	$member-cs-icon-zalo: url("/assets/images/icon-set/csicons/black/zalo.svg"),
	$member-cs-icon-imo: url("/assets/images/icon-set/csicons/black/imo.svg"),
	$member-cs-icon-email: url("/assets/images/icon-set/csicons/black/email.svg"),
	$member-cs-icon-qq: url("/assets/images/icon-set/csicons/black/qq.svg"),
	$member-cs-icon-wechat: url("/assets/images/icon-set/csicons/black/wechat.svg"),
	$member-cs-icon-skype: url("/assets/images/icon-set/csicons/black/skype.svg"),
	$member-cs-icon-bbm: url("/assets/images/icon-set/csicons/black/bbm.svg"),
	$member-cs-icon-kakao: url("/assets/images/icon-set/csicons/black/kakaotalk.svg"),
	$member-cs-icon-phone: url("/assets/images/icon-set/csicons/black/phone.svg"),
	$member-cs-icon-talk: url("/assets/images/icon-set/csicons/black/talk.svg"),
	$member-cs-icon-viber: url("/assets/images/icon-set/csicons/black/viber.svg"),

	//卡片
	$color-card-title: #14805e,
	$color-card-label-text: #ffffff,
	$color-card-label-bg: #4a4a4a,
	$color-card-label-border: #333333,

	//推薦
	$color-recommend-bg: #333333,
	$color-recommend-title-line: '',

	//優惠
	$btn-deposit: #ff7e00,
	$p-text-promotion: #111111,

	//登入註冊忘記密碼
	$img-eyes-open: url("/assets/images/icon-set/icon-eye-open-type02.svg"),
	$img-eyes-close: url("/assets/images/icon-set/icon-eye-close-type02.svg"),

	//生物辨識登入
	$btn-biometric: #FDD137,

	//生物辨識設定
	$wave-line-gradient-start: #14805e,
	$wave-line-gradient-end: #58B893,
	$path-face-color: #888888,

	//生物辨識首頁POP
	$wave-color-1: #14805E,
	$wave-color-2: #a0f0e5,
	$face-gradient-start: #50B08B,
	$face-gradient-end: #a3f1ca,
	$color-close-btn: #555555,
	$color-title-text: #14805E,
	$color-content-text: rgba(#000000, .6),

	//pop 語言與幣值選擇
	$color-li-bottom-border: #eeeeee, //線條編框
	$color-language-text: #ffffff, //文字
	$color-language-selected: #FFDF1A, //已選的語系選項顏色
	$bg-pop-language: #3e3e3e,
	$svg-transaction-close: #ffffff,

	//主選單
	$color-menu-bg1: #252525,
	$color-menu-bg2: #333333,
	$color-menu-ul-bottom: #111111,
	$color-menu-line: #464646,
	$img-menu-icon-home: url("/assets/images/icon-set/theme-icon/black/icon-home.svg"),
	$img-menu-icon-sport: url("/assets/images/icon-set/theme-icon/black/icon-sport.svg"),
	$img-menu-icon-casino: url("/assets/images/icon-set/theme-icon/black/icon-casino.svg"),
	$img-menu-icon-slot: url("/assets/images/icon-set/theme-icon/black/icon-slot.svg"),
	$img-menu-icon-card: url("/assets/images/icon-set/theme-icon/black/icon-card.svg"),
	$img-menu-icon-esport: url("/assets/images/icon-set/theme-icon/black/icon-esport.svg"),
	$img-menu-icon-lottery: url("/assets/images/icon-set/theme-icon/black/icon-lottery.svg"),
	$img-menu-icon-fish: url("/assets/images/icon-set/theme-icon/black/icon-fish.svg"),
	$img-menu-icon-hundreds: url("/assets/images/icon-set/theme-icon/black/icon-hundreds.svg"),
	$img-menu-icon-promotion: url("/assets/images/icon-set/theme-icon/black/icon-promotion.svg"),
	$img-menu-icon-vip: url("/assets/images/icon-set/theme-icon/black/icon-vip.svg"),
	$img-menu-icon-download: url("/assets/images/icon-set/theme-icon/black/icon-download.svg"),
	$img-menu-icon-phone: url("/assets/images/icon-set/theme-icon/black/icon-phone.svg"),
	$img-menu-icon-talk: url("/assets/images/icon-set/theme-icon/black/icon-talk.svg"),
	$img-menu-icon-forum: url("/assets/images/icon-set/theme-icon/black/icon-forum.svg"),
	$img-menu-icon-table: url("/assets/images/icon-set/theme-icon/black/icon-table.svg"),
	$img-menu-icon-arcade: url("/assets/images/icon-set/theme-icon/black/icon-arcade.svg"),
	$img-nav-icon-table: url("/assets/images/icon-set/theme-icon/black/icon-table.svg"),
	$img-nav-icon-arcade: url("/assets/images/icon-set/theme-icon/black/icon-arcade.svg"),

	//register-success 註冊成功頁
	$font-register-tit: #14805e,
	$register-tag: #FFDF1A,

	//pop
	$pop-color: #14805e,
	$color-login-title: #555555,
	$color-login-h3: #ffffff,
	//$bg-pop: #262626,
	$bg-table: #262626,
	$pop-text: #333333,

	// pop inbox
	$color-editor-menu-bg: #333333,
	$color-editor-menu-text: #ffffff,
	$color-editor-check-bg: #14805e,
	$color-editor-check-text: #ffffff,

	//登入前下方註冊按鈕
	$bg-register-button: #FFDF1A,
	$font-register-button: #000000,

	$btn-secondary: #FFAE12,
	$btn-default-bg: rgba(#027AFF, .1),

	$menu-cs-icon-phone: url("/assets/images/icon-set/theme-icon/black//icon-member-phone.svg"),
	$menu-cs-icon-talk: url("/assets/images/icon-set/theme-icon/black//icon-member-talk.svg"),

	//pop login fail
	$login-fail-tip-bg: rgba(#6B3132, .8),
	$login-fail-tip-border: #E38385,
	$login-fail-tip-icon: #E38385,
	$login-fail-tip-text: #E38385,
	$login-fail-lock-title: #EC5454,
	$login-fail-lock-text: #ffffff,
	$login-fail-lock-bg: #262626,
	$login-fail-btn-forget-password: #14805e,
	$login-fail-btn-closed: gray,

	//go top
	$gotop-bg: #50B08B,

	//launch game
	$launch-linear-bg: linear-gradient(180deg, #616161 0%, #0B0C14 100%),
	$launch-logo: url("/assets/images/launch-game/logo-bj.png"),
	$launch-menu-bg: linear-gradient(0deg, rgba(14, 75, 54, 0.7) 2%, #14805e 100%),
	$launch-menu-highlight: linear-gradient(0deg, rgba(14, 75, 54, .3) 0%,rgba(20, 128, 94, 0) 50%),
	$launch-menu-highlight-shadow-color01: #16867b,
	$launch-menu-highlight-shadow-color02: rgba(#ffffff, .5),
	$launch-btn-bg: linear-gradient(180deg, #616161 0%, #0B0C14 100%),
	$launch-nodeposit-btn-bg: linear-gradient(180deg, rgba(71, 78, 120, 0) 0%, rgba(71, 78, 120, 0)),
	$launch-btn-icon:  #cbcbcb,
	$lanuch-stop-color: #14805e,
	$lanuch-end-color:  #39D89F,
	$lanuch-nodeposit-logo:  url("/assets/images/launch-game/logo-w-bj.png"),
	$lanuch-site-bg: linear-gradient(0deg, rgba(#155847, .5) 2%, rgba(#131817, .8) 100%),
);

@forward './global-assets/v1/h5/scss/player/common/player-variables' with (


	//--------------------------- player 頁面 --------------------------- //

	// player form
	$font-player-form-text: #ffffff,
	$font-player-form-text-i: #eeeeee,
	$color-player-form-dashed: #555555,
	$color-player-form-border: #5e5e5b,
	$font-player-form-highlight-text: #FFDF1A,
	$color-player-form-highlight-bg: #FFDF1A,
	$color-player-form-highlight-bg-reverse: #111111,

	$svg-player-form-checked: #FFDF1A,
	$img-player-form-checked: url("/assets/images/player/select-check.svg"),

	// bank maintain
	$color-bank-supplier-maintain-bg: rgba(#000000, .8),
	$color-bank-supplier-maintain-border: #aaaaaa,
	$color-bank-supplier-maintain-text: #aaaaaa,
	// $color-bank-supplier-maintain-tag-bg: rgba(#ffffff, 0.8),
	$bank-card-frost-mask: rgba(#aaaaaa, .8),
	$bank-card-frost-txt: #333333,
	$bank-card-frost-icon: #333333,

	// select-bar
	$color-select-bar-form-bg: #36bc8b,
	$color-select-bar-form-text: #ffffff,
	$color-select-bar-form-tri: #ffffff,

	// form-list
	$color-form-list-icon-bg: rgba(#000000, .1),
	$color-form-list-icon: rgba(#000000, .1),
	$svg-form-list-delete: rgba(#ffffff, .6),

	// pop-setwallet
	$color-pop-setwallet-bg: #eeeeee,
	$pop-setwallet-text: #333333,
	$color-pop-setwallet-shadow: rgba(0, 0, 0, .1),
	$color-pop-setwallet-form: #ffffff,
	$color-pop-setwallet-form-hightline: rgba(#000000, .5),

	// pop-other-account
	$color-pop-select-bg: #333333,
	$color-pop-btn-border: #262626,
	$color-pop-repair: #444444,

	// list
	$color-record-item-text: #ffffff,
	$color-record-item-border: #555555,
	$color-record-item-bg: #333333,
	$color-record-item-bg-even: #262626,
	$color-item-title-bg: #777777,
	$color-item-title-border: #ffffff,

	// list sum
	$color-record-sum-title: #ffffff,
	$color-record-sum-text: #eeeeee,
	$color-record-sum-border: #555555,
	$color-record-sum-bg: #262626,
	$svg-editor-chose: #999999,

	// 提示視窗
	$img-tip-icon: url("/assets/images/icon-set/icon-question.svg"),
	$svg-tip-icon: #999999,
	$color-tip-box-text: #eeeeee,
	$color-tip-box-bg: #999999,
	$color-tip-box-border: #aaaaaa,
	$color-line-revocation: #b6b6b6,
	$color-line-void: #fccf3a,
	$color-line-refund: #d35b5b,

	// pagination
	$color-page-text: #ffffff,
	$color-page-input-border: #14805e,
	$color-page-active: #14805e,
	$color-page-disable: #999999,

	//側選單語系選擇
	$languag-sidebar-color: #eeeeee,

	// 輸入驗證碼
	$color-get-vcode-bg: #FFAE12,
	$font-get-vcode-color: #ffffff,
	$font-get-vcode-color-active: #FFAE12,
	$font-resend-vcode-color: #FD777A,

	$svg-header-bg: #111111,

	// tag free
	$color-tag-free-bg: #FFE800,
	$svg-tag-free: #111111,

	// transaction records details pop
	$pop-header-bg: #555555,
	$pop-transaction-title: #ffffff,
	$pop-date-color: #ffffff,

	//--------------------------- 新獎金錢包 --------------------------- //

	// dropDown menu
	$dropDown-menu-bg: #13805d,
	$dropDown-menu-under-review-bg: #1bacc9,
	$dropDown-menu-success: #1bc892,
	$dropDown-menu-failed: #f16163,

	//tab
	$tabBtn-bar-active: #34af83,

	$color-player-gradient-bg: #14805E,

	//卡片背景
	$color-walletcard-bg: linear-gradient(0deg, #3a3a3a 0%, #666666 100%),
	$color-walletcard-gray-bg: linear-gradient(0deg, #3a3a3a 0%, #1f1e1e 100%),
	$color-walletcard-dot: rgba(255,255,255,0.2),

	//卡片文字
	$color-walletcard-title-text: #bdbdbd,
	$color-walletcard-detail-text: #ffffff,
	$color-walletcard-bar-text: #ffffff,
	$color-walletcard-border: #69aaff,

	$color-walletcard-processing-btn: linear-gradient(230deg, #666666 0%, #666666 100%),
	$img-walletcard-dec-line: url("/assets/images/player/wallet-dec-line-dark.png"),

	// ticket
	$color-ticket-text: #eaeaea,
	$color-ticket-border: #1dc892,
	$color-ticket-border-disable: #484d48,
	$color-ticket-bg: #21342e,
	$color-ticket-bg-completed:#333333,
	$color-ticket-discount: #fdd137,
	$color-ticket-discount-complete: #fdd137,
	$color-ticket-discount-disable: #999999,
	$color-progress-shadow: #999,
	$color-progress-bar-mine: linear-gradient( to right, #d7b94b, #c2ab66),
	$color-progress-shadow-mine: #d7b94b,
	$color-progress-bar-yellow: linear-gradient( to right, #FFE800, #FFD03C),
	$color-progress-shadow-yellow: #FFE800,

	//彈出樣式
	$color-walletcard-pop-bg: #3e3e3e,
	$color-walletcard-event-bg: linear-gradient(180deg, #555555 0%, #777777 100%),
	$color-walletcard-event-notch: #3e3e3e,

	//--------------------------- 推薦好友 --------------------------- //

	$color-rf-box-bg: #3e3e3e,
	$color-rf-box-shadow: rgba(#3e3e3e, .5),
	$color-rf-box-title-b: linear-gradient(180deg, #7783FD 0%, #5664FA 100%),
	$color-rf-p: #ffffff,
	$color-rf-span: #ffffff,
	// $color-rf-input-border: #6E8AD2,
	// $color-rf-input-btn: linear-gradient(270deg, #6481CD 0%, #A1B6EE 80%),
	// $color-rf-btn-text: #ffffff,
	// $color-rf-btn: linear-gradient(60deg, #FFAE12 0%, #FFBF44 100%),

	$color-rf-conditionbox-title: #A1B6EE,
	// $color-rf-conditionbox-dot: #A1B6EE,
	$color-rf-conditionbox-bg: #4d4f50,

	// $color-rf-statusbox-text-highlight: #FFB016,
	$color-rf-statusbox-text: #cecece,
	$color-rf-statusbox-input-date-text: #cecece,
	$color-rf-statusbox-input-date-border: #666666,
	$color-rf-statusbox-input-date-bg: #3e3e3e,

	// $color-rf-submit-btn-text: #ffffff,
	// $color-rf-submit-btn: linear-gradient(270deg, #6481CD 0%, #A1B6EE 80%),
	// $color-rf-submit-btn-color: #ffffff,

	// $color-rf-status-text: #FFAC00,
	$color-rf-list-bg: #2a2a2a,
	$color-rf-list-shadow: rgba(#3e3e3e, .5),
	$color-rf-list-form-title-text: #ffffff,
	$color-rf-list-form-content-bg: #4a4a4a,
	$color-rf-list-form-content-bg2: #3a3a3a,
	$color-rf-list-form-content-text: #E5E5E5,
	$color-rf-list-form-content-border: #5a5a5a,
	// $color-rf-list-completetime-text: #45A556,


	$gradient-card-0: linear-gradient(240deg, #157e80,  #15805f),
	$gradient-card-1: linear-gradient(240deg, #555555, #555555),

	//--------------------------- VIP --------------------------- //

	$color-vip-box-title-b: #19916b,
	$color-vip-statusbox-text-highlight: #39D89F,
	$color-vip-dot: #000000,
	$color-vip-btn: linear-gradient(270deg, #2FB19E 0%, #19916b 100%),
	$color-vip-lv-ball-text: #dadada,
	$color-vip-lv-light-bg:#4c4c4c,

	//--------------------------- KYC --------------------------- //

	//task card
	$taskcard-wrap: #4e4e4e,
	$taskcard-bg: desaturate( darken(#FFF2D2, 70%), 80%),
	$taskcard-border: #FFB026,
	$taskcard-title-bg: #FFB026,
	$taskcard-title-text: #ffffff,
	$taskcard-box-line: darken(#D8D8D8, 40%),
	$taskcard-box-circle-bg: darken(#D8D8D8, 40%),
	$taskcard-box-circle-border: darken(#979797, 40%),
	$taskcard-box-circle-text: darken(#979797, 40%),

	$taskcard-box-title: #ffe29d,
	$taskcard-box-subTitle: #ffa200,

	//accordion: default
	$accordion-wrap-bg: #262626,
	$accordion-wrap-border: saturate( lighten( adjust-hue(#14805e, 8), 7%), 10%),
	$accordion-title-bg: saturate( lighten( adjust-hue(#14805e, 8), 7%), 10%),
	$accordion-title-text: #262626,
	$accordion-content-text: #eaeaea,

	$img-accordion-icon: url("/assets/images/icon-set/player/kyc/accordion-tips.svg"),
	$svg-accordion-icon: #262626,
	$img-accordion-arrow: url("/assets/images/icon-set/player/kyc/accordion-arrow.svg"),
	$svg-accordion-arrow: #262626,

	//accordion: error
	$accordion-e-wrap-border: #fd3e64,

	//upload img
	$upload-wrap-bg: desaturate( darken( adjust-hue(#14805e, 8), 18%), 55%),
	$upload-wrap-border: saturate( lighten( adjust-hue(#14805e, 8), 7%), 10%),
	$upload-area-text: saturate( lighten( adjust-hue(#14805e, 8), 7%), 10%),
	$upload-btn-bg: saturate( lighten( adjust-hue(#14805e, 8), 7%), 10%),

	$svg-upload-camera: saturate( lighten( adjust-hue(#14805e, 8), 7%), 10%),

	//提示說明
	$tips-info-bg: #212b44,
	$tips-info-border: #556cad,
	$tips-info-txt: #ffffff,
	$tips-info-i:#ffffff,
	$tips-info-link-txt: #212b44,
	$tips-info-close: rgba(#ffffff, .8),

	//VIP points
	$vip-lv1: url("/assets/images/vip/rank1.png") no-repeat center / contain,
	$vip-lv2: url("/assets/images/vip/rank2.png") no-repeat center / contain,
	$vip-lv3: url("/assets/images/vip/rank3.png") no-repeat center / contain,
	$vip-lv4: url("/assets/images/vip/rank4.png") no-repeat center / contain,
	$vip-lv5: url("/assets/images/vip/rank5.png") no-repeat center / contain,
	$vip-lv6: url("/assets/images/vip/rank6.png") no-repeat center / contain,
	$vip-lv1-s: url("/assets/images/vip/rank1.png") no-repeat top center / 100%,
	$vip-lv2-s: url("/assets/images/vip/rank2.png") no-repeat top center / 100%,
	$vip-lv3-s: url("/assets/images/vip/rank3.png") no-repeat top center / 100%,
	$vip-lv4-s: url("/assets/images/vip/rank4.png") no-repeat top center / 100%,
	$vip-lv5-s: url("/assets/images/vip/rank5.png") no-repeat top center / 100%,
	$vip-lv6-s: url("/assets/images/vip/rank6.png") no-repeat top center / 100%,
	$vip-title-bg: #14805e,
	$vip-content-bg: linear-gradient(245deg, #244b3a 0%, #193226 25%, #193226 100%),
	$vip-card-bg: linear-gradient(120deg, rgba(#32473a, .7) 0%, rgba(#153329, .7) 40%, rgba(#1c5650, .7) 80%, rgba(#1f6340, .7) 100%),
	$vip-bar-inner-bg: linear-gradient(to right, #A56C0B 0%,#B69942 25%, #F8E67D 50%,#e6c86d 75%, #c5994c 100%),
	$vip-bar-inner-shadow: #e6c86d,
	$vip-total-icon: #C9A33D,
	$vip-cash-point-bg: linear-gradient(180deg, rgba(43, 46, 45, 0.5) 0%, rgba(32, 180, 141, 0.5) 100%),
	$vip-point-input-font: #D0A11B,
	$vip-point-input-error: #C75647,
	$vip-chevron-def: #D0A11B,
	$vip-button-allow: linear-gradient(90deg, #F8E67D 0%, #734B07 100%),
	$vip-button-allow-text-shadow: #7F5811,
	$vip-button-allow-box-shadow: rgba(#666149, .5),
	$vip-button-default: linear-gradient(90deg, #465550 0%, #465550 100%),
);

 `
)

console.log(qq)