package fr.fullstack.shopapp.service;

import fr.fullstack.shopapp.model.Product;
import fr.fullstack.shopapp.model.Shop;
import fr.fullstack.shopapp.repository.ShopRepository;
import fr.fullstack.shopapp.repository.ShopSearchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ShopService {

    @PersistenceContext
    private EntityManager em;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ShopSearchRepository shopSearchRepository;

    @Transactional
    public Shop createShop(Shop shop) throws Exception {
        try {
            Shop newShop = shopRepository.save(shop);
            em.flush();
            em.refresh(newShop);
            return newShop;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    @Transactional
    public void deleteShopById(long id) throws Exception {
        try {
            Shop shop = getShop(id);
            deleteNestedRelations(shop);
            shopRepository.deleteById(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    public Shop getShopById(long id) throws Exception {
        return getShop(id);
    }

    @Transactional
    public Shop updateShop(Shop shop) throws Exception {
        try {
            getShop(shop.getId());
            return this.createShop(shop);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    public Page<Shop> getShopList(
            Optional<String> sortBy,
            Optional<Boolean> inVacations,
            // CORRECTION : Inversion de createdBefore et createdAfter pour matcher le Controller
            Optional<String> createdAfter,
            Optional<String> createdBefore,
            Optional<String> name,
            Pageable pageable
    ) {
        Optional<LocalDate> afterDate = parseDate(createdAfter);
        Optional<LocalDate> beforeDate = parseDate(createdBefore);
        if ((name.isPresent() && !name.get().trim().isEmpty()) ||
                inVacations.isPresent() ||
                afterDate.isPresent() ||
                beforeDate.isPresent()) {

            return shopSearchRepository.search(
                    name.orElse(null),
                    inVacations,
                    afterDate,
                    beforeDate,
                    sortBy,
                    pageable
            );
        }
        if (sortBy.isPresent() && !sortBy.get().isEmpty()) {
            switch (sortBy.get()) {
                case "name": return shopRepository.findByOrderByNameAsc(pageable);
                case "createdAt": return shopRepository.findByOrderByCreatedAtAsc(pageable);
                case "nbProducts": return shopRepository.findByOrderByNbProductsAsc(pageable);
                default: return shopRepository.findByOrderByNbProductsAsc(pageable);
            }
        }

        return shopRepository.findByOrderByIdAsc(pageable);
    }

    // Cette méthode appelle maintenant celle que nous avons ajoutée au Repository
    public Map<String, Object> getElasticsearchIndexInfo() {
        return shopSearchRepository.getIndexInfo();
    }

    private Optional<LocalDate> parseDate(Optional<String> dateStr) {
        if (dateStr.isPresent()) {
            try {
                return Optional.of(LocalDate.parse(dateStr.get()));
            } catch (DateTimeParseException e) {
                // Ignore invalid dates
            }
        }
        return Optional.empty();
    }

    private Shop getShop(Long id) throws Exception {
        return shopRepository.findById(id)
                .orElseThrow(() -> new Exception("Shop with id " + id + " not found"));
    }

    private void deleteNestedRelations(Shop shop) {
        List<Product> products = shop.getProducts();
        for (Product product : products) {
            product.setShop(null);
            em.merge(product);
        }
        em.flush();
    }
}