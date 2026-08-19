import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rosterData = {
  "Period 81": [
    { "firstName": "Kiara B", "lastName": "Aguilar-Morales", "gradeLevel": 8 },
    { "firstName": "Yaretzy R", "lastName": "Analco", "gradeLevel": 8 },
    { "firstName": "Kaylee", "lastName": "Andres Pedro", "gradeLevel": 8 },
    { "firstName": "Malena A", "lastName": "Banks", "gradeLevel": 8 },
    { "firstName": "Janelly", "lastName": "Barragan-Candela", "gradeLevel": 8 },
    { "firstName": "Elias B", "lastName": "Bernal Avila", "gradeLevel": 8 },
    { "firstName": "Zinedine", "lastName": "Casiano-Montes", "gradeLevel": 8 },
    { "firstName": "Jayden T", "lastName": "Clark", "gradeLevel": 8 },
    { "firstName": "Esther", "lastName": "Cuevas-Lopez", "gradeLevel": 8 },
    { "firstName": "Kalieze T", "lastName": "Eaton", "gradeLevel": 8 },
    { "firstName": "Nathanal R", "lastName": "Flowers", "gradeLevel": 8 },
    { "firstName": "Bradley A", "lastName": "Fontaine", "gradeLevel": 8 },
    { "firstName": "Jener A", "lastName": "Lopez Yanes", "gradeLevel": 8 },
    { "firstName": "Jose A", "lastName": "Lozano Saucedo", "gradeLevel": 8 },
    { "firstName": "Angel M", "lastName": "Maganda Casiano", "gradeLevel": 8 },
    { "firstName": "Alice P", "lastName": "Montalvan-Vasquez", "gradeLevel": 8 },
    { "firstName": "Natalie A", "lastName": "Moore", "gradeLevel": 8 },
    { "firstName": "Reggie L", "lastName": "Moore III", "gradeLevel": 8 },
    { "firstName": "Angel D", "lastName": "Olmedo-Hernandez", "gradeLevel": 8 },
    { "firstName": "Zyan M", "lastName": "Robinson", "gradeLevel": 8 },
    { "firstName": "Franco I", "lastName": "Sanchez", "gradeLevel": 8 },
    { "firstName": "Jaylend A", "lastName": "Silva-Arellanez", "gradeLevel": 8 },
    { "firstName": "Kadeem E", "lastName": "Thom", "gradeLevel": 8 },
    { "firstName": "Martin J", "lastName": "Toscano Salinas", "gradeLevel": 8 },
    { "firstName": "Mario A", "lastName": "Vasquez-Segovia", "gradeLevel": 8 },
    { "firstName": "Ricardo J", "lastName": "Velasco-Martinez", "gradeLevel": 8 }
  ],
  "Period 82": [
    { "firstName": "Damian", "lastName": "Aguilar Marroquin", "gradeLevel": 8 },
    { "firstName": "Katherine N", "lastName": "Arellano Quintanilla", "gradeLevel": 8 },
    { "firstName": "Naomi M", "lastName": "Banger", "gradeLevel": 8 },
    { "firstName": "Roxaly", "lastName": "Bernal-Penaloza", "gradeLevel": 8 },
    { "firstName": "Peyton", "lastName": "Brazeal", "gradeLevel": 8 },
    { "firstName": "Aiden M", "lastName": "Brewster", "gradeLevel": 8 },
    { "firstName": "Gajuan K", "lastName": "Crawford", "gradeLevel": 8 },
    { "firstName": "Kharyan D", "lastName": "Davis", "gradeLevel": 8 },
    { "firstName": "Miguel M", "lastName": "De Los Santos", "gradeLevel": 8 },
    { "firstName": "Jose A", "lastName": "Diaz", "gradeLevel": 8 },
    { "firstName": "Allisson", "lastName": "Garcia-Carrillo", "gradeLevel": 8 },
    { "firstName": "Natali J", "lastName": "Garcia-Julian", "gradeLevel": 8 },
    { "firstName": "Ci'ree", "lastName": "Harvey", "gradeLevel": 8 },
    { "firstName": "Alberto", "lastName": "Hernandez-Salinas", "gradeLevel": 8 },
    { "firstName": "Miguel A", "lastName": "Maldonado Santos", "gradeLevel": 8 },
    { "firstName": "Jefferson S", "lastName": "Melgar Jr.", "gradeLevel": 8 },
    { "firstName": "Jermauria A", "lastName": "Miller-Oglesby", "gradeLevel": 8 },
    { "firstName": "Ana K", "lastName": "Noyola Cisneros", "gradeLevel": 8 },
    { "firstName": "Brittany", "lastName": "Quintero", "gradeLevel": 8 },
    { "firstName": "Blake J", "lastName": "Scales", "gradeLevel": 8 },
    { "firstName": "Jayceon T", "lastName": "Silva", "gradeLevel": 8 },
    { "firstName": "Joyce D", "lastName": "Silva-Villarreal", "gradeLevel": 8 },
    { "firstName": "Addai Y", "lastName": "Williams", "gradeLevel": 8 },
    { "firstName": "Stephanie", "lastName": "Zamorano-Gonzalez", "gradeLevel": 8 }
  ],
  "Period 83": [
    { "firstName": "Mara-Lynn", "lastName": "Aycock", "gradeLevel": 8 },
    { "firstName": "Grace S", "lastName": "Bundor", "gradeLevel": 8 },
    { "firstName": "Aryana A", "lastName": "Dearmon", "gradeLevel": 8 },
    { "firstName": "Laniyah S", "lastName": "Farley", "gradeLevel": 8 },
    { "firstName": "Brooklynne D", "lastName": "Flow", "gradeLevel": 8 },
    { "firstName": "Aydalyz", "lastName": "Gutierrez-Garcia", "gradeLevel": 8 },
    { "firstName": "Ci'ree", "lastName": "Harvey", "gradeLevel": 8 },
    { "firstName": "Luis A", "lastName": "Hernandez", "gradeLevel": 8 },
    { "firstName": "Deshayla", "lastName": "Hernandez-Garcia", "gradeLevel": 8 },
    { "firstName": "Alicia G", "lastName": "Horton", "gradeLevel": 8 },
    { "firstName": "Javier", "lastName": "Isidro-Duarte", "gradeLevel": 8 },
    { "firstName": "Roni", "lastName": "Lopez Hernandez", "gradeLevel": 8 },
    { "firstName": "Cesar S", "lastName": "Luna Martinez", "gradeLevel": 8 },
    { "firstName": "Joe", "lastName": "Martinez Nonthe", "gradeLevel": 8 },
    { "firstName": "David J", "lastName": "Matos Salas", "gradeLevel": 8 },
    { "firstName": "Alaysia", "lastName": "McDonald", "gradeLevel": 8 },
    { "firstName": "Keyanna D", "lastName": "Moore", "gradeLevel": 8 },
    { "firstName": "Itzia", "lastName": "Noyola-Marquez", "gradeLevel": 8 },
    { "firstName": "Jayden J", "lastName": "Pineda", "gradeLevel": 8 },
    { "firstName": "Aveah L", "lastName": "Robinson", "gradeLevel": 8 },
    { "firstName": "Jada'Kiss A", "lastName": "Robinson", "gradeLevel": 8 },
    { "firstName": "Stephanie M", "lastName": "Saucedo Bernal", "gradeLevel": 8 },
    { "firstName": "Leonardo N", "lastName": "Schmidt", "gradeLevel": 8 },
    { "firstName": "Leah I", "lastName": "Sixtos-Colon", "gradeLevel": 8 },
    { "firstName": "Celeste M", "lastName": "Staup", "gradeLevel": 8 },
    { "firstName": "Irvin", "lastName": "Toscano-Rivera", "gradeLevel": 8 }
  ]
};

export async function GET() {
  try {
    let nelson = await prisma.user.findFirst({
      where: { name: { contains: 'Nelson', mode: 'insensitive' } }
    });

    if (!nelson) {
      nelson = await prisma.user.create({
        data: {
          name: "Kendall Nelson",
          role: "CORE_TEACHER",
          roomNumber: "C308",
          gradeLevel: 8
        }
      });
    }

    let totalCreated = 0;

    for (const [periodName, students] of Object.entries(rosterData)) {
      let roster = await prisma.roster.findFirst({
        where: {
          name: periodName,
          teacherId: nelson.id
        }
      });

      if (!roster) {
        roster = await prisma.roster.create({
          data: {
            name: periodName,
            type: "CORE",
            teacherId: nelson.id
          }
        });
      }

      for (const s of students) {
        // Prevent duplicates
        const existing = await prisma.student.findFirst({
          where: {
            firstName: s.firstName,
            lastName: s.lastName,
            rosters: { some: { id: roster.id } }
          }
        });

        if (!existing) {
          await prisma.student.create({
            data: {
              firstName: s.firstName,
              lastName: s.lastName,
              gradeLevel: s.gradeLevel,
              rosters: {
                connect: { id: roster.id }
              }
            }
          });
          totalCreated++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Successfully seeded " + totalCreated + " new students for Mr. Nelson!" 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


