import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../../../types';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * تسجيل مستخدم جديد (عميل أو وكيل أو موظف)
   */
  async register(data: any) {
    const { username, password, name, role, email, phone } = data;

    // Fix: Accessing user model via any cast
    const existingUser = await (this.prisma as any).user.findUnique({ 
      where: { username: username.toLowerCase() } 
    });

    if (existingUser) {
      throw new ConflictException('اسم المستخدم محجوز مسبقاً في النظام');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
    
    // Fix: Accessing user model via any cast
    return (this.prisma as any).user.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword,
        name,
        role: role || UserRole.CUSTOMER,
        email,
        phone,
        balance: 0,
        createdAt: new Date(),
        profile: {
          create: {
            // تفاصيل إضافية للملف الشخصي
          }
        }
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        balance: true
      }
    });
  }

  /**
   * التحقق من الهوية وتوليد التوكن
   */
  async login(credentials: any) {
    const { username, password } = credentials;

    // Fix: Accessing user model via any cast
    const user = await (this.prisma as any).user.findUnique({ 
      where: { username: username.toLowerCase() } 
    });

    if (!user) {
      throw new UnauthorizedException('فشل المصادقة: اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('فشل المصادقة: اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const payload = { 
      sub: user.id, 
      username: user.username, 
      role: user.role,
      name: user.name 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        balance: user.balance
      }
    };
  }

  /**
   * التحقق من صلاحية التوكن واسترجاع بيانات المستخدم
   */
  async validateUser(userId: string) {
    // Fix: Accessing user model via any cast
    const user = await (this.prisma as any).user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}