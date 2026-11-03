package com.horizon.airways.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    public void sendPasswordResetEmail(String toEmail, String firstName, String resetToken) {
        log.info("Attempting to send password reset email to {}", toEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Full Stack Aviation");
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Full Stack Aviation Password");
            helper.setText(buildResetEmailHtml(firstName, resetToken), true);

            mailSender.send(message);
            log.info("Password reset email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {} — {}: {}", toEmail, e.getClass().getSimpleName(), e.getMessage(), e);
        }
    }

    private String buildResetEmailHtml(String firstName, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#134e4a 0%%,#0d9488 60%%,#2dd4bf 100%%);padding:36px 40px;text-align:center;">
                        <div style="font-size:2rem;margin-bottom:8px;">✈</div>
                        <h1 style="margin:0;color:#fff;font-size:1.5rem;font-weight:800;letter-spacing:-0.02em;">
                          Full Stack Aviation
                        </h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,.65);font-size:0.85rem;">
                          Password Reset Request
                        </p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 20px;font-size:1rem;color:#1e293b;">
                          Hi <strong>%s</strong>,
                        </p>
                        <p style="margin:0 0 24px;font-size:0.95rem;color:#475569;line-height:1.6;">
                          We received a request to reset the password for your Full Stack Aviation account.
                          Click the button below to choose a new password. This link is valid for
                          <strong>30 minutes</strong>.
                        </p>

                        <!-- CTA Button -->
                        <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                          <tr>
                            <td style="background:linear-gradient(135deg,#0d9488,#2dd4bf);border-radius:10px;text-align:center;">
                              <a href="%s"
                                 style="display:inline-block;padding:14px 36px;color:#fff;font-size:0.95rem;
                                        font-weight:700;text-decoration:none;letter-spacing:0.02em;">
                                Reset My Password
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0 0 8px;font-size:0.82rem;color:#94a3b8;">
                          Or copy and paste this URL in your browser:
                        </p>
                        <p style="margin:0 0 28px;font-size:0.78rem;color:#64748b;word-break:break-all;
                                  background:#f8fafc;padding:10px 14px;border-radius:8px;border:1px solid #e2e8f0;">
                          %s
                        </p>

                        <div style="border-top:1px solid #e2e8f0;padding-top:20px;">
                          <p style="margin:0;font-size:0.82rem;color:#94a3b8;line-height:1.6;">
                            If you didn't request a password reset, you can safely ignore this email —
                            your password will not change. For security questions, contact our support team.
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;font-size:0.78rem;color:#94a3b8;">
                          © 2026 Full Stack Aviation · All rights reserved
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(firstName, resetUrl, resetUrl);
    }
}
