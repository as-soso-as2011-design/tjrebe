(function(){
  const KEY = 'teacher_dashboard_rebuilt_v3';
  const cfg = window.MATHBANK_FIREBASE || {};
  if(!cfg.enabled) return;
  if(typeof firebase === 'undefined'){
    console.warn('Firebase SDK غير محمل.');
    return;
  }
  const appName = 'mathbank-app';
  let app;
  try { app = firebase.app(appName); } catch(e) { app = firebase.initializeApp({
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
    storageBucket: cfg.storageBucket,
    messagingSenderId: cfg.messagingSenderId,
    appId: cfg.appId
  }, appName); }
  const db = firebase.firestore(app);
  const docRef = db.collection(cfg.collection || 'math_bank_sites').doc(cfg.documentId || 'primary');
  const stateApi = {
    lastLocalJson: null,
    lastRemoteStamp: '',
    ready: true,
    async pull(){
      const snap = await docRef.get();
      if(!snap.exists) return null;
      const data = snap.data() || {};
      if(!data.state) return null;
      const json = JSON.stringify(data.state);
      localStorage.setItem(KEY, json);
      this.lastLocalJson = json;
      this.lastRemoteStamp = data.updatedAt || '';
      window.dispatchEvent(new CustomEvent('mathbank:state-updated', {detail:{source:'firebase-pull'}}));
      return data.state;
    },
    async push(rawState){
      const state = rawState || JSON.parse(localStorage.getItem(KEY) || '{}');
      const json = JSON.stringify(state);
      if(this.lastLocalJson === json) return;
      this.lastLocalJson = json;
      const updatedAt = new Date().toISOString();
      this.lastRemoteStamp = updatedAt;
      await docRef.set({ state, updatedAt }, { merge:true });
      window.dispatchEvent(new CustomEvent('mathbank:state-synced', {detail:{source:'firebase-push', updatedAt}}));
    }
  };
  window.mathBankFirebase = stateApi;
  docRef.onSnapshot(function(snap){
    if(!snap.exists) return;
    const data = snap.data() || {};
    if(!data.state) return;
    const json = JSON.stringify(data.state);
    if(json === (stateApi.lastLocalJson || localStorage.getItem(KEY))) return;
    localStorage.setItem(KEY, json);
    stateApi.lastLocalJson = json;
    stateApi.lastRemoteStamp = data.updatedAt || '';
    window.dispatchEvent(new CustomEvent('mathbank:state-updated', {detail:{source:'firebase-live'}}));
  }, function(err){ console.warn('Firebase snapshot error', err); });
  setInterval(function(){
    const current = localStorage.getItem(KEY);
    if(current && current !== stateApi.lastLocalJson){
      try{ stateApi.push(JSON.parse(current)); }catch(e){}
    }
  }, Number(cfg.syncIntervalMs || 1500));
  setTimeout(function(){ stateApi.pull().catch(()=>{}); }, 250);
})();
