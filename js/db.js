/* Brasil Patriota - BD local (IndexedDB): pedidos + leads (cupom) */
(function(){
  const DB_NAME = 'brasilpatriota_db';
  const DB_VER = 1;
  let dbp = null;

  function open(){
    if(dbp) return dbp;
    dbp = new Promise((resolve, reject)=>{
      try{
        const req = indexedDB.open(DB_NAME, DB_VER);
        req.onupgradeneeded = ()=>{
          const db = req.result;
          if(!db.objectStoreNames.contains('orders'))
            db.createObjectStore('orders', { keyPath: 'order' });
          if(!db.objectStoreNames.contains('leads'))
            db.createObjectStore('leads', { keyPath: 'id', autoIncrement: true });
        };
        req.onsuccess = ()=>resolve(req.result);
        req.onerror = ()=>reject(req.error);
      }catch(e){ reject(e); }
    });
    return dbp;
  }

  function put(store, value){
    return open().then(db=>new Promise((resolve, reject)=>{
      try{
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).put(value);
        tx.oncomplete = ()=>resolve(true);
        tx.onerror = ()=>reject(tx.error);
      }catch(e){ reject(e); }
    })).catch(()=>{ // fallback: localStorage
      try{
        const k = 'brasilpatriota_'+store;
        const arr = JSON.parse(localStorage.getItem(k)||'[]');
        arr.push(value);
        localStorage.setItem(k, JSON.stringify(arr));
        return true;
      }catch(e){ return false; }
    });
  }

  function all(store){
    return open().then(db=>new Promise((resolve)=>{
      try{
        const tx = db.transaction(store, 'readonly');
        const rq = tx.objectStore(store).getAll();
        rq.onsuccess = ()=>resolve(rq.result||[]);
        rq.onerror = ()=>resolve([]);
      }catch(e){ resolve([]); }
    })).catch(()=>{
      try{ return JSON.parse(localStorage.getItem('brasilpatriota_'+store)||'[]'); }
      catch(e){ return []; }
    });
  }

  function clear(store){
    return open().then(db=>new Promise((resolve)=>{
      try{
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).clear();
        tx.oncomplete = ()=>resolve(true);
        tx.onerror = ()=>resolve(false);
      }catch(e){ resolve(false); }
    })).catch(()=>false);
  }

  window.BPDB = {
    saveOrder: (order)=>put('orders', order),
    getOrders: ()=>all('orders'),
    clearOrders: ()=>clear('orders'),
    saveLead: (lead)=>put('leads', Object.assign({ date: new Date().toISOString() }, lead)),
    getLeads: ()=>all('leads')
  };
})();
