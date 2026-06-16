import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCertification } from './entities/user-certification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TrustService {
  constructor(
    @InjectRepository(UserCertification)
    private certRepo: Repository<UserCertification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // ===== Certification =====

  async applyCertification(userId: number, dto: {
    certType?: string; speciesExperience?: Array<{ species: string; years: number; count: number }>;
    years?: number; selfDescription?: string; proofPhotos?: string[];
  }): Promise<UserCertification> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pending = await this.certRepo.findOne({
      where: { userId, status: 'pending' } as any,
    });
    if (pending) throw new BadRequestException('You have a pending certification');

    const cert = this.certRepo.create({
      userId,
      certType: dto.certType || 'pet_experience',
      speciesExperience: dto.speciesExperience || null,
      years: dto.years || 0,
      selfDescription: dto.selfDescription || null,
      proofPhotos: dto.proofPhotos || null,
      status: 'pending',
    });
    return this.certRepo.save(cert);
  }

  async getUserCertifications(userId: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.certRepo.find({ where: { userId } as any, order: { createdAt: 'DESC' } });
  }

  async verifyCertification(certId: number, status: string, adminId: number, remark?: string) {
    const cert = await this.certRepo.findOne({ where: { id: certId } });
    if (!cert) throw new NotFoundException('Certification not found');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.certRepo.update(certId, {
      status,
      verifiedAt: new Date(),
      verifiedBy: adminId,
      adminRemark: remark || null,
    } as any);

    // If approved, mark user as helper and update credit score
    if (status === 'approved') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.userRepo.update(cert.userId, { isHelper: true } as any);
      await this.recalculateCreditScore(cert.userId);
    }
  }

  // ===== Credit Score =====

  async getCreditScore(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return {
      score: user.creditScore,
      breakdown: {
        rating: Math.min(user.ratingAvg / 5 * 50, 50),
        completion: Math.min(user.completionRate * 30, 30),
        experience: Math.min((user.completedWalks > 0 ? Math.min(user.completedWalks / 100, 1) : 0) * 20, 20),
      },
      stats: {
        ratingAvg: user.ratingAvg,
        completionRate: user.completionRate,
        completionCount: user.completionCount,
        cancellationCount: user.cancellationCount,
        completedWalks: user.completedWalks,
        isHelper: user.isHelper,
      },
    };
  }

  async recalculateCreditScore(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const certifications = await this.certRepo.find({
      where: { userId, status: 'approved' } as any,
    });
    const maxYears = certifications.reduce((max, c) => Math.max(max, c.years), 0);
    const experiencePct = Math.min(maxYears / 10, 1);

    const score = Math.round(
      ((user.ratingAvg / 5) * 50 +
       user.completionRate * 30 +
       experiencePct * 20) * 100
    ) / 100;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.userRepo.update(userId, { creditScore: score } as any);
    return score;
  }
}
