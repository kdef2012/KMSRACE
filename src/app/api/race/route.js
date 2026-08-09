import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        logs: true
      }
    });

    const settings = await prisma.settings.findFirst();
    const goalType = settings ? settings.goalType : 'POINTS';
    const goalValue = settings ? settings.goalValue : '1000';
    
    // For calculating percentage visually
    const target = goalType === 'POINTS' ? (parseInt(goalValue) || 1000) : 1000;

    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const grades = { 
      6: { students: 0, points: 0, bestStudent: null, maxPoints5d: -1 }, 
      7: { students: 0, points: 0, bestStudent: null, maxPoints5d: -1 }, 
      8: { students: 0, points: 0, bestStudent: null, maxPoints5d: -1 } 
    };

    students.forEach(student => {
      const g = student.gradeLevel;
      if (grades[g]) {
        grades[g].students += 1;
        
        let studentPoints5d = 0;

        // Calculate points for this student
        student.logs.forEach(log => {
          let points = 0;
          if (log.workHabits) points += 5;
          if (log.behavior) points += 1;
          if (log.attendance) points += 2;
          if (log.punctuality) points += 1;
          if (log.dressCode) points += 1;
          
          grades[g].points += points;

          if (new Date(log.date) >= fiveDaysAgo) {
             studentPoints5d += points;
          }
        });

        if (studentPoints5d > grades[g].maxPoints5d && studentPoints5d > 0) {
           grades[g].maxPoints5d = studentPoints5d;
           grades[g].bestStudent = `${student.firstName} ${student.lastName}`;
        }
      }
    });

    // Calculate normalized score (Average Points per Student)
    const results = [6, 7, 8].map(g => {
      const avgPoints = grades[g].students > 0 ? (grades[g].points / grades[g].students) : 0;
      
      let percentage = 0;
      if (goalType === 'POINTS') {
        percentage = Math.min((avgPoints / target) * 100, 100);
      } else {
        // If it's time based, we can just visually represent percentage relative to the highest score
        percentage = avgPoints > 0 ? avgPoints : 0; // We will adjust this below
      }
      
      return {
        grade: g,
        avgPoints: avgPoints.toFixed(1),
        percentage: percentage,
        starScholar: grades[g].bestStudent || 'None yet'
      };
    });

    if (goalType === 'TIME') {
       const maxScore = Math.max(...results.map(r => r.percentage), 10);
       results.forEach(r => {
         r.percentage = Math.min((r.percentage / maxScore) * 100, 100).toFixed(1);
       });
    } else {
       results.forEach(r => r.percentage = r.percentage.toFixed(1));
    }

    // Sort by percentage descending (1st, 2nd, 3rd place)
    results.sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json({ results, goalType, goalValue });
  } catch (error) {
    console.error('Error calculating race:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
