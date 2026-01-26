package fr.fullstack.shopapp.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = OpeningHoursValidator.class)
@Documented
public @interface ValidOpeningHours {
    String message() default "Les plages horaires ne peuvent pas se chevaucher pour un même jour";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}