// AudioMass Localization
(function (w) {
    'use strict';

    var translations = {
        en: {
            // App
            appTitle: 'AudioMass - Audio Editor',
            appDescription: 'AudioMass is a free full-featured web-based audio & waveform editing tool',
            
            // Welcome Modal
            welcomeTitle: 'Welcome to AudioMass',
            welcomeDesc: 'AudioMass is a free, open source, web-based Audio and Waveform Editor.<br />It runs entirely in the browser with no backend and no plugins required!',
            tips: 'Tips:',
            mobileTip: 'Please make sure your device is not in silent mode. You might need to physically flip the silent switch.',
            desktopTip: 'Please keep in mind that most key shortcuts rely on the <strong>Shift + <u>key</u></strong> combo. (eg Shift+Z for undo, Shift+C copy, Shift+X cut... etc )',
            githubLink: 'Check out the codebase on <a href="https://github.com/pkalogiros/audiomass" target="_blank">Github</a>',
            featuresDesc: 'You can load any type of audio your browser supports and perform operations such as fade in, cut, trim, change the volume, and apply a plethora of audio effects.',
            ok: 'OK',
            
            // Errors
            errorTitle: 'Oops! Something is not right',
            
            // Menu - File
            file: 'File',
            exportDownload: 'Export / Download',
            exportTitle: 'Export / Download',
            fileName: 'File Name',
            filenamePlaceholder: 'mp3 filename',
            format: 'Format',
            mp3Format: 'MP3 - Compressed, lossy format',
            wavFormat: 'WAV - Uncompressed, lossless format',
            flacFormat: 'FLAC - Compressed, lossless format',
            quality: 'Quality / Bitrate',
            exportRange: 'Export Range',
            exportAll: 'All audio',
            exportSelection: 'Selection only',
            channels: 'Channels',
            mono: 'Mono (Merge both channels into one)',
            stereo: 'Stereo',
            export: 'Export',
            
            // Menu - Edit
            edit: 'Edit',
            undo: 'Undo',
            redo: 'Redo',
            cut: 'Cut',
            copy: 'Copy',
            paste: 'Paste',
            delete: 'Delete',
            selectAll: 'Select All',
            
            // Menu - Effects
            effects: 'Effects',
            fadeIn: 'Fade In',
            fadeOut: 'Fade Out',
            normalize: 'Normalize',
            reverse: 'Reverse',
            invert: 'Invert Phase',
            
            // Toolbar
            play: 'Play',
            pause: 'Pause',
            stop: 'Stop',
            record: 'Record',
            zoomIn: 'Zoom In',
            zoomOut: 'Zoom Out',
            selectTool: 'Select',
            moveTool: 'Move',
            
            // Status
            loading: 'Loading...',
            processing: 'Processing...',
            ready: 'Ready',
            
            // Time display
            start: 'Start',
            end: 'End',
            duration: 'Duration',
            
            // Common
            cancel: 'Cancel',
            close: 'Close',
            save: 'Save',
            apply: 'Apply',
            remove: 'Remove',
            reset: 'Reset',
            loadingAudio: 'Loading Audio...',
            processingAudio: 'Processing Audio...',
            
            // Download options
            compressionLevel: 'Compression Level',
            k128: '128 kbps (Standard quality)',
            k192: '192 kbps (Good quality)',
            k256: '256 kbps (High quality)',
            k320: '320 kbps (Highest quality)',
            flacFast: 'Fast (Less compression)',
            flacBest: 'Best (Maximum compression)',
        },
        zh: {
            // App
            appTitle: 'AudioMass - 音频编辑器',
            appDescription: 'AudioMass 是一个免费的基于网页的全功能音频和波形编辑工具',
            
            // Welcome Modal
            welcomeTitle: '欢迎使用 AudioMass',
            welcomeDesc: 'AudioMass 是一个免费、开源的基于网页的音频和波形编辑器。<br />它完全在浏览器中运行，无需后端和插件！',
            tips: '提示：',
            mobileTip: '请确保您的设备未处于静音模式。您可能需要物理翻转静音开关。',
            desktopTip: '请记住，大多数快捷键都依赖 <strong>Shift + <u>按键</u></strong> 组合。（例如 Shift+Z 撤销，Shift+C 复制，Shift+X 剪切...等）',
            githubLink: '在 <a href="https://github.com/pkalogiros/audiomass" target="_blank">Github</a> 上查看代码',
            featuresDesc: '您可以加载浏览器支持的任何类型的音频，并执行淡入、剪切、修剪、更改音量以及应用大量音频效果等操作。',
            ok: '确定',
            
            // Errors
            errorTitle: '哎呀！出了点问题',
            
            // Menu - File
            file: '文件',
            exportDownload: '导出 / 下载',
            exportTitle: '导出 / 下载',
            fileName: '文件名',
            filenamePlaceholder: 'mp3 文件名',
            format: '格式',
            mp3Format: 'MP3 - 压缩有损格式',
            wavFormat: 'WAV - 未压缩无损格式',
            flacFormat: 'FLAC - 压缩无损格式',
            quality: '质量 / 比特率',
            exportRange: '导出范围',
            exportAll: '全部音频',
            exportSelection: '仅选中部分',
            channels: '声道',
            mono: '单声道（合并两个声道）',
            stereo: '立体声',
            export: '导出',
            
            // Menu - Edit
            edit: '编辑',
            undo: '撤销',
            redo: '重做',
            cut: '剪切',
            copy: '复制',
            paste: '粘贴',
            delete: '删除',
            selectAll: '全选',
            
            // Menu - Effects
            effects: '效果',
            fadeIn: '淡入',
            fadeOut: '淡出',
            normalize: '标准化',
            reverse: '反转',
            invert: '相位反转',
            
            // Toolbar
            play: '播放',
            pause: '暂停',
            stop: '停止',
            record: '录音',
            zoomIn: '放大',
            zoomOut: '缩小',
            selectTool: '选择',
            moveTool: '移动',
            
            // Status
            loading: '加载中...',
            processing: '处理中...',
            ready: '就绪',
            
            // Time display
            start: '开始',
            end: '结束',
            duration: '时长',
            
            // Common
            cancel: '取消',
            close: '关闭',
            save: '保存',
            apply: '应用',
            remove: '移除',
            reset: '重置',
            loadingAudio: '正在加载音频...',
            processingAudio: '正在处理音频...',
            
            // Download options
            compressionLevel: '压缩级别',
            k128: '128 kbps（标准质量）',
            k192: '192 kbps（良好质量）',
            k256: '256 kbps（高质量）',
            k320: '320 kbps（最高质量）',
            flacFast: '快速（较低压缩）',
            flacBest: '最佳（最大压缩）',
        },
        ja: {
            // App
            appTitle: 'AudioMass - オーディオエディタ',
            appDescription: 'AudioMass は無料のフル機能ウェブベースのオーディオ・波形編集ツールです',
            
            // Welcome Modal
            welcomeTitle: 'AudioMass へようこそ',
            welcomeDesc: 'AudioMass は無料のオープンソース・ウェブベースのオーディオ・波形エディタです。<br />バックエンドやプラグイン不要で、完全にブラウザ内で動作します！',
            tips: 'ヒント：',
            mobileTip: 'デバイスがサイレントモードになっていないことを確認してください。物理的にサイレントスイッチを切り替える必要があるかもしれません。',
            desktopTip: 'ほとんどのショートカットキーは <strong>Shift + <u>キー</u></strong> の組み合わせを使用することを覚えておいてください。（例：Shift+Z で元に戻す、Shift+C でコピー、Shift+X で切り取り...等）',
            githubLink: '<a href="https://github.com/pkalogiros/audiomass" target="_blank">Github</a> でコードを確認',
            featuresDesc: 'ブラウザがサポートする任意のタイプのオーディオを読み込み、フェードイン、カット、トリム、音量変更、さまざまなオーディオ効果の適用などの操作を行うことができます。',
            ok: 'OK',
            
            // Errors
            errorTitle: 'エラーが発生しました',
            
            // Menu - File
            file: 'ファイル',
            exportDownload: 'エクスポート / ダウンロード',
            exportTitle: 'エクスポート / ダウンロード',
            fileName: 'ファイル名',
            filenamePlaceholder: 'mp3 ファイル名',
            format: 'フォーマット',
            mp3Format: 'MP3 - 圧縮・ロスィー形式',
            wavFormat: 'WAV - 非圧縮・ロスレス形式',
            flacFormat: 'FLAC - 圧縮・ロスレス形式',
            quality: '品質 / ビットレート',
            exportRange: 'エクスポート範囲',
            exportAll: 'すべてのオーディオ',
            exportSelection: '選択部分のみ',
            channels: 'チャンネル',
            mono: 'モノラル（両チャンネルを統合）',
            stereo: 'ステレオ',
            export: 'エクスポート',
            
            // Menu - Edit
            edit: '編集',
            undo: '元に戻す',
            redo: 'やり直し',
            cut: '切り取り',
            copy: 'コピー',
            paste: '貼り付け',
            delete: '削除',
            selectAll: 'すべて選択',
            
            // Menu - Effects
            effects: 'エフェクト',
            fadeIn: 'フェードイン',
            fadeOut: 'フェードアウト',
            normalize: 'ノーマライズ',
            reverse: '逆再生',
            invert: '位相反転',
            
            // Toolbar
            play: '再生',
            pause: '一時停止',
            stop: '停止',
            record: '録音',
            zoomIn: 'ズームイン',
            zoomOut: 'ズームアウト',
            selectTool: '選択',
            moveTool: '移動',
            
            // Status
            loading: '読み込み中...',
            processing: '処理中...',
            ready: '準備完了',
            
            // Time display
            start: '開始',
            end: '終了',
            duration: '長さ',
            
            // Common
            cancel: 'キャンセル',
            close: '閉じる',
            save: '保存',
            apply: '適用',
            remove: '削除',
            reset: 'リセット',
            loadingAudio: 'オーディオを読み込み中...',
            processingAudio: 'オーディオを処理中...',
            
            // Download options
            compressionLevel: '圧縮レベル',
            k128: '128 kbps（標準品質）',
            k192: '192 kbps（良好品質）',
            k256: '256 kbps（高品質）',
            k320: '320 kbps（最高品質）',
            flacFast: '高速（低圧縮）',
            flacBest: '最高（最大圧縮）',
        },
        ko: {
            // App
            appTitle: 'AudioMass - 오디오 편집기',
            appDescription: 'AudioMass는 무료 웹 기반 전체 기능을 갖춘 오디오 및 파형 편집 도구입니다',
            
            // Welcome Modal
            welcomeTitle: 'AudioMass에 오신 것을 환영합니다',
            welcomeDesc: 'AudioMass는 무료 오픈 소스 웹 기반 오디오 및 파형 편집기입니다.<br />백엔드나 플러그인 없이 브라우저에서 완전히 실행됩니다!',
            tips: '팁:',
            mobileTip: '기기가 무음 모드가 아닌지 확인하세요. 물리적으로 무음 스위치를 뒤집어야 할 수도 있습니다.',
            desktopTip: '대부분의 키보드 단축키는 <strong>Shift + <u>키</u></strong> 조합을 사용합니다. (예: Shift+Z 실행 취소, Shift+C 복사, Shift+X 잘라내기...등)',
            githubLink: '<a href="https://github.com/pkalogiros/audiomass" target="_blank">Github</a>에서 코드 확인',
            featuresDesc: '브라우저가 지원하는 모든 유형의 오디오를 로드하고 페이드 인, 자르기, 트림, 볼륨 변경 및 다양한 오디오 효과를 적용할 수 있습니다.',
            ok: '확인',
            
            // Errors
            errorTitle: '문제가 발생했습니다',
            
            // Menu - File
            file: '파일',
            exportDownload: '내보내기 / 다운로드',
            exportTitle: '내보내기 / 다운로드',
            fileName: '파일 이름',
            filenamePlaceholder: 'mp3 파일명',
            format: '형식',
            mp3Format: 'MP3 - 압축 손실 형식',
            wavFormat: 'WAV - 비압축 무손실 형식',
            flacFormat: 'FLAC - 압축 무손실 형식',
            quality: '품질 / 비트레이트',
            exportRange: '내보내기 범위',
            exportAll: '전체 오디오',
            exportSelection: '선택 영역만',
            channels: '채널',
            mono: '모노 (두 채널 병합)',
            stereo: '스테레오',
            export: '내보내기',
            
            // Menu - Edit
            edit: '편집',
            undo: '실행 취소',
            redo: '다시 실행',
            cut: '잘라내기',
            copy: '복사',
            paste: '붙여넣기',
            delete: '삭제',
            selectAll: '모두 선택',
            
            // Menu - Effects
            effects: '효과',
            fadeIn: '페이드 인',
            fadeOut: '페이드 아웃',
            normalize: '정규화',
            reverse: '역재생',
            invert: '위상 반전',
            
            // Toolbar
            play: '재생',
            pause: '일시정지',
            stop: '정지',
            record: '녹음',
            zoomIn: '확대',
            zoomOut: '축소',
            selectTool: '선택',
            moveTool: '이동',
            
            // Status
            loading: '로딩 중...',
            processing: '처리 중...',
            ready: '준비 완료',
            
            // Time display
            start: '시작',
            end: '종료',
            duration: '길이',
            
            // Common
            cancel: '취소',
            close: '닫기',
            save: '저장',
            apply: '적용',
            remove: '제거',
            reset: '재설정',
            loadingAudio: '오디오 로딩 중...',
            processingAudio: '오디오 처리 중...',
            
            // Download options
            compressionLevel: '압축 레벨',
            k128: '128 kbps (표준 품질)',
            k192: '192 kbps (양호한 품질)',
            k256: '256 kbps (고품질)',
            k320: '320 kbps (최고 품질)',
            flacFast: '빠른 (낮은 압축)',
            flacBest: '최고 (최대 압축)',
        }
    };

    var currentLang = 'en';
    
    // Detect language from localStorage (sync with ACE-Step UI), URL, or browser
    function detectLanguage() {
        // First try localStorage (sync with ACE-Step UI main app)
        try {
            var savedLang = localStorage.getItem('language');
            if (savedLang && translations[savedLang]) {
                return savedLang;
            }
        } catch (e) {
            // localStorage not available
        }
        
        // Then try URL parameter
        var urlLang = w.location.href.match(/[?&]lang=([a-z]{2})/);
        if (urlLang && translations[urlLang[1]]) {
            return urlLang[1];
        }
        
        // Finally try browser language
        var browserLang = (navigator.language || navigator.userLanguage).substr(0, 2);
        if (translations[browserLang]) {
            return browserLang;
        }
        return 'en';
    }

    currentLang = detectLanguage();

    w.AudioMassI18n = {
        t: function(key) {
            return translations[currentLang][key] || translations['en'][key] || key;
        },
        getCurrentLang: function() {
            return currentLang;
        },
        setLang: function(lang) {
            if (translations[lang]) {
                currentLang = lang;
            }
        },
        getAvailableLangs: function() {
            return Object.keys(translations);
        }
    };

})(window);
