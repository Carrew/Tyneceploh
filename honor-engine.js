import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

async function getStudents(){

  const snap = await getDocs(collection(db,"users"));

  const map = {};

  snap.forEach(d=>{

    const u = d.data();

    if(u.role === "student"){

      map[u.userId] = u;

    }

  });

  return map;

}

export async function generateHonorRoll(selectedClass, period){

  const rulesSnap = await getDoc(doc(db,"honorRules","main"));
  const rules = rulesSnap.data();

  const students = await getStudents();

  const resultsSnap = await getDocs(collection(db,"results"));

  const results = [];

  resultsSnap.forEach(d=>{

    const r = d.data();

    if(!students[r.studentId]) return;
    if(students[r.studentId].class !== selectedClass) return;
    if(r.period !== period) return;

    results.push(r);

  });

  const grouped = {};

  Object.keys(students).forEach(id=>{

    const s = students[id];

    if(s.class !== selectedClass) return;

    const studentResults = results.filter(r=>r.studentId === id);

    if(studentResults.length === 0) return;

    let total = 0;
    let count = 0;
    let disqualified = false;

    studentResults.forEach(r=>{

      const score = Number(r.score);

      total += score;
      count++;

      if(
        rules.disqualifyOnRedMark &&
        score <= rules.redMarkLimit
      ){
        disqualified = true;
      }

    });

    const avg = total / count;

    let category = "NONE";

    if(disqualified){
      category = "DISQUALIFIED";
    }else{

      for(const b of rules.bands){
        if(avg >= b.min && avg <= b.max){
          category = b.name;
        }
      }

    }

    grouped[id] = {
      studentId:id,
      name:s.name,
      class:s.class,
      average:avg,
      category,
      period
    };

  });

  await setDoc(
    doc(db,"honorResults",selectedClass+"_"+period),
    {
      class:selectedClass,
      period,
      results:Object.values(grouped),
      generatedAt:Date.now()
    }
  );

  return grouped;

}
