package fr.fullstack.shopapp.validation;

import fr.fullstack.shopapp.model.OpeningHoursShop;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.List;

public class OpeningHoursValidator implements ConstraintValidator<ValidOpeningHours, List<OpeningHoursShop>> {

    @Override
    public boolean isValid(List<OpeningHoursShop> hours, ConstraintValidatorContext context) {
        if (hours == null || hours.isEmpty()) {
            return true;
        }

        for (int i = 0; i < hours.size(); i++) {
            OpeningHoursShop h1 = hours.get(i);
            for (int j = i + 1; j < hours.size(); j++) {
                OpeningHoursShop h2 = hours.get(j);

                // Vérifier si c'est le même jour
                if (h1.getDay() == h2.getDay()) {
                    // Logique de chevauchement : (Début1 < Fin2) ET (Fin1 > Début2)
                    if (h1.getOpenAt().isBefore(h2.getCloseAt()) && h1.getCloseAt().isAfter(h2.getOpenAt())) {
                        return false; // Conflit trouvé
                    }
                }
            }
        }

        return true;
    }
}
