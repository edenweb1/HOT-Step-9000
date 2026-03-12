/**
 * Demucs Web - i18n System
 */

(function() {
  'use strict';

  const translations = {
    en: {
      // Header
      stemExtraction: 'Stem Extraction',
      aiPoweredSeparation: 'AI-powered audio separation using Demucs',
      detecting: 'Detecting...',
      webgpu: 'WebGPU (GPU)',
      wasm: 'WASM ({threads} threads)',
      
      // Upload
      dropAudioHere: 'Drop audio file here',
      orClickToSelect: 'or click to select',
      
      // Processing
      processing: 'Processing',
      extractStems: 'Extract Stems',
      selectAudioToBegin: 'Select an audio file to begin',
      loadingAiModel: 'Loading AI model...',
      downloadingModel: 'Downloading model (~172MB)...',
      loadingLocalModel: 'Loading local model...',
      readySelectAudio: 'Ready - Select an audio file',
      failedToLoadModel: 'Failed to load model:',
      
      // Status during processing
      loadingAudio: 'Loading audio...',
      loadedDurationReady: 'Loaded: {duration}s - Ready to extract',
      loadedDurationStarting: 'Loaded: {duration}s - Starting extraction...',
      failedToLoadAudio: 'Failed to load audio:',
      readingAudio: 'Reading audio...',
      failedToReadAudio: 'Failed to read audio:',
      preparingAudio: 'Preparing audio...',
      extractingStems: 'Extracting stems...',
      processingFailed: 'Processing failed:',
      
      // Stats
      elapsed: 'Elapsed',
      segment: 'Segment',
      speed: 'Speed',
      eta: 'ETA',
      
      // Log phases
      init: 'Init',
      resample: 'Resample',
      done: 'Done',
      
      // Log messages
      startingStemExtraction: 'Starting stem extraction...',
      completedIn: 'Completed in {time}s ({speed}x realtime)',
      
      // Results
      separatedTracks: 'Separated Tracks',
      clickToPlayDownload: 'Click to play, download individual stems',
      downloadAll: 'Download All',
      
      // Track labels
      drums: 'Drums',
      bass: 'Bass',
      instrumental: 'Instrumental',
      vocals: 'Vocals',
      
      // Complete status
      completeExtractedStems: 'Complete! Extracted 4 stems in {time}s',
      
      // Download format
      wav: 'WAV',
    },
    zh: {
      // Header
      stemExtraction: '音轨分离',
      aiPoweredSeparation: '基于 AI 的音频分离 - 使用 Demucs',
      detecting: '检测中...',
      webgpu: 'WebGPU (GPU)',
      wasm: 'WASM ({threads} 线程)',
      
      // Upload
      dropAudioHere: '将音频文件拖放到此处',
      orClickToSelect: '或点击选择文件',
      
      // Processing
      processing: '处理中',
      extractStems: '提取音轨',
      selectAudioToBegin: '选择音频文件开始',
      loadingAiModel: '加载 AI 模型中...',
      downloadingModel: '下载模型中 (~172MB)...',
      loadingLocalModel: '加载本地模型...',
      readySelectAudio: '就绪 - 选择音频文件',
      failedToLoadModel: '加载模型失败：',
      
      // Status during processing
      loadingAudio: '加载音频中...',
      loadedDurationReady: '已加载: {duration}秒 - 准备提取',
      loadedDurationStarting: '已加载: {duration}秒 - 开始提取...',
      failedToLoadAudio: '加载音频失败：',
      readingAudio: '读取音频中...',
      failedToReadAudio: '读取音频失败：',
      preparingAudio: '准备音频中...',
      extractingStems: '提取音轨中...',
      processingFailed: '处理失败：',
      
      // Stats
      elapsed: '已用时间',
      segment: '段落',
      speed: '速度',
      eta: '预计完成',
      
      // Log phases
      init: '初始化',
      resample: '重采样',
      done: '完成',
      
      // Log messages
      startingStemExtraction: '开始音轨分离...',
      completedIn: '耗时 {time}秒 ({speed}x 实时速度)',
      
      // Results
      separatedTracks: '分离的音轨',
      clickToPlayDownload: '点击播放或下载单个音轨',
      downloadAll: '全部下载',
      
      // Track labels
      drums: '鼓声',
      bass: '贝斯',
      instrumental: '乐器',
      vocals: '人声',
      
      // Complete status
      completeExtractedStems: '完成！共提取 4 条音轨，耗时 {time}秒',
      
      // Download format
      wav: 'WAV',
    },
    ja: {
      // Header
      stemExtraction: 'ステム抽出',
      aiPoweredSeparation: 'Demucs を使用した AI 音声分離',
      detecting: '検出中...',
      webgpu: 'WebGPU (GPU)',
      wasm: 'WASM ({threads} スレッド)',
      
      // Upload
      dropAudioHere: '音声ファイルをここにドロップ',
      orClickToSelect: 'またはクリックして選択',
      
      // Processing
      processing: '処理中',
      extractStems: 'ステムを抽出',
      selectAudioToBegin: '音声ファイルを選択して開始',
      loadingAiModel: 'AI モデルを読み込み中...',
      downloadingModel: 'モデルをダウンロード中 (~172MB)...',
      loadingLocalModel: 'ローカルモデルを読み込み中...',
      readySelectAudio: '準備完了 - 音声ファイルを選択',
      failedToLoadModel: 'モデルの読み込みに失敗：',
      
      // Status during processing
      loadingAudio: '音声を読み込み中...',
      loadedDurationReady: '読み込み完了: {duration}秒 - 抽出準備完了',
      loadedDurationStarting: '読み込み完了: {duration}秒 - 抽出開始...',
      failedToLoadAudio: '音声の読み込みに失敗：',
      readingAudio: '音声を読み取り中...',
      failedToReadAudio: '音声の読み取りに失敗：',
      preparingAudio: '音声を準備中...',
      extractingStems: 'ステムを抽出中...',
      processingFailed: '処理に失敗：',
      
      // Stats
      elapsed: '経過時間',
      segment: 'セグメント',
      speed: '速度',
      eta: '残り時間',
      
      // Log phases
      init: '初期化',
      resample: 'リサンプリング',
      done: '完了',
      
      // Log messages
      startingStemExtraction: 'ステム抽出を開始...',
      completedIn: '{time}秒で完了 ({speed}x リアルタイム)',
      
      // Results
      separatedTracks: '分離されたトラック',
      clickToPlayDownload: 'クリックして再生、個別ステムをダウンロード',
      downloadAll: 'すべてダウンロード',
      
      // Track labels
      drums: 'ドラム',
      bass: 'ベース',
      instrumental: '楽器',
      vocals: 'ボーカル',
      
      // Complete status
      completeExtractedStems: '完了！{time}秒で 4 つのステムを抽出',
      
      // Download format
      wav: 'WAV',
    },
    ko: {
      // Header
      stemExtraction: '스템 추출',
      aiPoweredSeparation: 'Demucs를 사용한 AI 기반 오디오 분리',
      detecting: '감지 중...',
      webgpu: 'WebGPU (GPU)',
      wasm: 'WASM ({threads} 스레드)',
      
      // Upload
      dropAudioHere: '오디오 파일을 여기에 드롭',
      orClickToSelect: '또는 클릭하여 선택',
      
      // Processing
      processing: '처리 중',
      extractStems: '스템 추출',
      selectAudioToBegin: '오디오 파일을 선택하여 시작',
      loadingAiModel: 'AI 모델 로딩 중...',
      downloadingModel: '모델 다운로드 중 (~172MB)...',
      loadingLocalModel: '로컬 모델 로딩 중...',
      readySelectAudio: '준비 완료 - 오디오 파일 선택',
      failedToLoadModel: '모델 로딩 실패:',
      
      // Status during processing
      loadingAudio: '오디오 로딩 중...',
      loadedDurationReady: '로딩 완료: {duration}초 - 추출 준비 완료',
      loadedDurationStarting: '로딩 완료: {duration}초 - 추출 시작...',
      failedToLoadAudio: '오디오 로딩 실패:',
      readingAudio: '오디오 읽는 중...',
      failedToReadAudio: '오디오 읽기 실패:',
      preparingAudio: '오디오 준비 중...',
      extractingStems: '스템 추출 중...',
      processingFailed: '처리 실패:',
      
      // Stats
      elapsed: '경과 시간',
      segment: '구간',
      speed: '속도',
      eta: '예상 완료',
      
      // Log phases
      init: '초기화',
      resample: '리샘플링',
      done: '완료',
      
      // Log messages
      startingStemExtraction: '스템 추출 시작...',
      completedIn: '{time}초 만에 완료 ({speed}x 실시간)',
      
      // Results
      separatedTracks: '분리된 트랙',
      clickToPlayDownload: '클릭하여 재생, 개별 스템 다운로드',
      downloadAll: '모두 다운로드',
      
      // Track labels
      drums: '드럼',
      bass: '베이스',
      instrumental: '악기',
      vocals: '보컬',
      
      // Complete status
      completeExtractedStems: '완료! {time}초 만에 4개 스템 추출',
      
      // Download format
      wav: 'WAV',
    }
  };

  // Get language from localStorage (sync with ACE-Step UI) or browser
  // First try ACE-Step UI's language key, then fall back to demucs-lang
  const aceStepLang = localStorage.getItem('language');
  const demucsLang = localStorage.getItem('demucs-lang');
  const browserLang = navigator.language.slice(0, 2);
  const defaultLang = ['en', 'zh', 'ja', 'ko'].includes(aceStepLang) ? aceStepLang : 
                      ['en', 'zh', 'ja', 'ko'].includes(demucsLang) ? demucsLang :
                      ['en', 'zh', 'ja', 'ko'].includes(browserLang) ? browserLang : 'en';

  const I18n = {
    lang: defaultLang,
    translations: translations,
    
    t: function(key, params) {
      let text = translations[this.lang][key] || translations['en'][key] || key;
      if (params) {
        Object.keys(params).forEach(param => {
          text = text.replace(new RegExp('{' + param + '}', 'g'), params[param]);
        });
      }
      return text;
    },
    
    setLanguage: function(lang) {
      if (['en', 'zh', 'ja', 'ko'].includes(lang)) {
        this.lang = lang;
        localStorage.setItem('demucs-lang', lang);
        return true;
      }
      return false;
    },
    
    getLanguage: function() {
      return this.lang;
    },
    
    updatePage: function() {
      // Update static elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          const attr = el.getAttribute('data-i18n-attr');
          if (attr) {
            el.setAttribute(attr, this.t(key));
          } else {
            el.textContent = this.t(key);
          }
        }
      });
    }
  };

  // Expose globally
  window.DemucsI18n = I18n;

})();
