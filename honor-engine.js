import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

//
// MAIN ENGINE
//
export async function generateHonorRoll(selectedClass, period){

  console.log("Starting Honor Engine...");

  // 1. LOAD RULES
  const ruleSnap = await getDoc(
    doc(db,"honorRules","main")
  );

  if(!ruleSnap.exists()){
    throw new Error("Honor rules not set");
  }

  const rules = ruleSnap.data();

  console.log("Rules loaded:", rules);

  // 2. LOAD STUDENTS
  const studentsSnap = await getDocs(
    collection(db,"students")
  );

  // 3. LOAD GRADES
  const gradesSnap = await getDocs(
    collection(db,"grades")
  );

  const grades = [];

  gradesSnap.forEach(d=>{
    grades.push(d.data());
  });

  const results = [];

  // 4. LOOP STUDENTS
  studentsSnap.forEach(docSnap=>{

    const student = docSnap.data();

    if(student.class !== selectedClass) return;

    const studentGrades =
      grades.filter(g =>
        g.studentId === student.studentId &&
        g.period === period
      );

    if(studentGrades.length === 0) return;

    let total = 0;
    let count = 0;
    let disqualified = false;

    // 5. CALCULATE AVERAGE + RED MARK CHECK
    studentGrades.forEach(g=>{

      const score = Number(g.score);

      total += score;
      count++;

      // RED MARK CHECK
      if(
        rules.disqualifyOnRedMark &&
        score <= rules.redMarkLimit
      ){
        disqualified = true;
      }

    });

    const avg = total / count;

    let category = "NONE";

    // 6. APPLY DISQUALIFICATION FIRST
    if(disqualified){
      category = "DISQUALIFIED";
    }

    else{

      // 7. APPLY BANDS
      for(const b of rules.bands){

        if(avg >= b.min && avg <= b.max){
          category = b.name;
          break;
        }

      }

    }

    results.push({
      studentId: student.studentId,
      name: student.name,
      class: student.class,
      average: avg.toFixed(2),
      category,
      period,
      timestamp: Date.now()
    });

  });

  // 8. SAVE RESULTS
  await setDoc(
    doc(db,"honorResults",selectedClass+"_"+period),
    {
      class: selectedClass,
      period,
      results,
      generatedAt: Date.now()
    }
  );

  console.log("Honor Roll Generated:", results);

  return results;

}
