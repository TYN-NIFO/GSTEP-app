import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTestSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const createdById = searchParams.get('createdById')

    const where: any = {}

    // Role-based filtering
    if (session.user.role === 'HOD' || session.user.role === 'STAFF') {
      where.departmentId = session.user.departmentId
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    if (createdById) {
      where.createdById = createdById
    }

    const tests = await prisma.test.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        department: {
          select: {
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            questions: true,
            submissions: true
          }
        }
      }
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTestSchema.parse(body)

    // Ensure staff can only create tests for their department
    if (validatedData.departmentId !== session.user.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const test = await prisma.test.create({
      data: {
        ...validatedData,
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
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

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
