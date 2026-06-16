import { User } from '../../users/entities/user.entity';
export declare class UserCertification {
    id: number;
    userId: number;
    certType: string;
    speciesExperience: Array<{
        species: string;
        years: number;
        count: number;
    }> | null;
    years: number;
    selfDescription: string | null;
    proofPhotos: string[] | null;
    status: string;
    adminRemark: string | null;
    verifiedAt: Date | null;
    verifiedBy: number | null;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
