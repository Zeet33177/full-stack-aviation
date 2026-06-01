package com.horizon.airways.service;

import com.horizon.airways.dto.request.PaymentRequest;
import com.horizon.airways.dto.response.PaymentResponse;
import com.horizon.airways.entity.Booking;
import com.horizon.airways.entity.Payment;
import com.horizon.airways.enums.BookingStatus;
import com.horizon.airways.enums.PaymentStatus;
import com.horizon.airways.exception.PaymentException;
import com.horizon.airways.exception.ResourceNotFoundException;
import com.horizon.airways.repository.BookingRepository;
import com.horizon.airways.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request, Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getPassenger().getId().equals(userId)) {
            throw new PaymentException("Unauthorized payment attempt");
        }

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new PaymentException("Booking is already paid");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new PaymentException("Cannot pay for a cancelled booking");
        }

        validateCard(request);

        String maskedCard = maskCardNumber(request.getCardNumber());
        String transactionId = "TXN" + UUID.randomUUID().toString().toUpperCase().replace("-", "").substring(0, 12);

        Payment payment = Payment.builder()
                .booking(booking)
                .maskedCardNumber(maskedCard)
                .cardHolderName(request.getCardHolderName())
                .amount(booking.getTotalAmount())
                .transactionId(transactionId)
                .paymentMethod(request.getPaymentMethod())
                .build();
        payment.setStatus(PaymentStatus.SUCCESS);
        payment = paymentRepository.save(payment);

        // Confirm the booking
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "bookingId", bookingId));
        return toResponse(payment);
    }

    private void validateCard(PaymentRequest request) {
        if (!isValidLuhn(request.getCardNumber())) {
            throw new PaymentException("Invalid card number");
        }

        // Parse and check expiry MM/YY
        try {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/yy");
            YearMonth expiry = YearMonth.parse(request.getExpiryDate(), fmt);
            if (expiry.isBefore(YearMonth.now())) {
                throw new PaymentException("Card has expired");
            }
        } catch (Exception e) {
            throw new PaymentException("Invalid card expiry date");
        }
    }

    private boolean isValidLuhn(String cardNumber) {
        int sum = 0;
        boolean alternate = false;
        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(String.valueOf(cardNumber.charAt(i)));
            if (alternate) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return (sum % 10 == 0);
    }

    private String maskCardNumber(String cardNumber) {
        return "************" + cardNumber.substring(12);
    }

    public PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .bookingId(p.getBooking().getId())
                .bookingReference(p.getBooking().getBookingReference())
                .maskedCardNumber(p.getMaskedCardNumber())
                .cardHolderName(p.getCardHolderName())
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .status(p.getStatus().name())
                .transactionId(p.getTransactionId())
                .paymentMethod(p.getPaymentMethod())
                .build();
    }
}
