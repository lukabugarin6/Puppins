// TODO: Implementirati stvarno slanje mejlova i testirati u dev i produkciji

import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendVerificationEmail(email: string, token: string, firstName: string) {
    const verificationUrl = `http://localhost:3000/auth/verify-email?token=${token}`;
    
    // Mock email service za development - samo loguj u konzolu
    console.log('\n📧 ========== MOCK EMAIL SENT ==========');
    console.log(`📮 To: ${email}`);
    console.log(`👤 Name: ${firstName}`);
    console.log(`🔑 Verification Token: ${token}`);
    console.log(`🔗 Verification URL: ${verificationUrl}`);
    console.log(`\n🧪 COPY THIS TOKEN FOR SWAGGER TESTING:`);
    console.log(`   ${token}`);
    console.log('=====================================\n');

    // Simuliraj async operaciju
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      message: `Mock email sent to ${email}`,
      token: token, // Vraćamo token za lakše testiranje
    };
  }
}