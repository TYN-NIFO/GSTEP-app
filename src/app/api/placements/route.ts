import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const status = searchParams.get('status')

    const where: any = {}

    // Role-based filtering
    if (session.user.role === 'HOD' || session.user.role === 'STAFF') {
      where.departmentId = session.user.departmentId
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    if (status) {
      where.status = status
    }

    const placements = await prisma.placement.findMany({
      where,
      orderBy: { appliedAt: 'desc' },
      include: {
        student: {
          select: {
            rollNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            year: true,
            semester: true,
            cgpa: true
          }
        },
        company: {
          select: {
            name: true,
            industry: true,
            location: true
          }
        },
        department: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(placements)
  } catch (error) {
    console.error('Error fetching placements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'STAFF' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const { position, studentId, companyId, departmentId, package: packageAmount, interviewAt, notes } = body

    if (!position || !studentId || !companyId || !departmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ensure staff can only create placements for their department
    if (session.user.role === 'STAFF' && departmentId !== session.user.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const placement = await prisma.placement.create({
      data: {
        position,
        package: packageAmount ? parseFloat(packageAmount) : null,
        status: 'APPLIED',
        studentId,
        companyId,
        departmentId,
        interviewAt: interviewAt ? new Date(interviewAt) : null,
        notes
      },
      include: {
        student: {
          select: {
            rollNumber: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        company: {
          select: {
            name: true,
            industry: true,
            location: true
          }
        },
        department: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(placement, { status: 201 })
  } catch (error) {
    console.error('Error creating placement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
