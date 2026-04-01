package com.ufam.uforum.service;

import com.ufam.uforum.dto.request.CreateProductRequest;
import com.ufam.uforum.dto.response.ProductResponse;
import com.ufam.uforum.entity.Product;
import com.ufam.uforum.entity.User;
import com.ufam.uforum.enums.ProductStatus;
import com.ufam.uforum.exception.BusinessException;
import com.ufam.uforum.exception.ResourceNotFoundException;
import com.ufam.uforum.exception.UnauthorizedException;
import com.ufam.uforum.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserService userService;

    public Page<ProductResponse> listAvailable(Pageable pageable) {
        return productRepository.findByStatusAndIsActiveTrue(ProductStatus.AVAILABLE, pageable)
            .map(this::toResponse);
    }

    public Page<ProductResponse> listByCategory(String category, Pageable pageable) {
        return productRepository.findByCategoryAndStatusAndIsActiveTrue(
            category, ProductStatus.AVAILABLE, pageable).map(this::toResponse);
    }

    public Page<ProductResponse> search(String q, Pageable pageable) {
        return productRepository.search(q, pageable).map(this::toResponse);
    }

    public ProductResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    public Page<ProductResponse> getMyProducts(Pageable pageable) {
        User current = userService.getCurrentUser();
        return productRepository.findBySellerIdAndIsActiveTrue(current.getId(), pageable)
            .map(this::toResponse);
    }

    @Transactional
    public ProductResponse create(CreateProductRequest req) {
        User current = userService.getCurrentUser();

        if (current.getWhatsappNumber() == null || current.getWhatsappNumber().isBlank())
            throw new BusinessException("Adicione um número de WhatsApp no seu perfil antes de anunciar");

        Product product = Product.builder()
            .title(req.title())
            .description(req.description())
            .price(req.price())
            .category(req.category())
            .seller(current)
            .build();

        if (req.imageUrls() != null) product.getImageUrls().addAll(req.imageUrls());

        // saveAndFlush garante que o produto é persistido antes do toResponse acessar imageUrls
        product = productRepository.saveAndFlush(product);

        // Re-fetch with JOIN FETCH to avoid LazyInitializationException on imageUrls
        return toResponse(findOrThrow(product.getId()));
    }

    @Transactional
    public ProductResponse updateStatus(UUID id, String statusStr) {
        User current = userService.getCurrentUser();
        Product product = findOrThrow(id);

        if (!product.getSeller().getId().equals(current.getId()))
            throw new UnauthorizedException("Apenas o vendedor pode alterar o status");

        product.setStatus(ProductStatus.valueOf(statusStr.toUpperCase()));
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(UUID id) {
        User current = userService.getCurrentUser();
        Product product = findOrThrow(id);

        boolean isOwner = product.getSeller().getId().equals(current.getId());
        boolean isAdmin = current.getRole().name().equals("ADMIN");

        if (!isOwner && !isAdmin)
            throw new UnauthorizedException("Sem permissão para remover este anúncio");

        product.setIsActive(false);
        productRepository.save(product);
    }

    private Product findOrThrow(UUID id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
    }

    private ProductResponse toResponse(Product p) {
        String whatsapp = p.getSeller().getWhatsappNumber();
        return new ProductResponse(
            p.getId(), p.getTitle(), p.getDescription(), p.getPrice(),
            p.getCategory(), p.getStatus().name(), p.getImageUrls(),
            userService.toSummary(p.getSeller()), whatsapp, p.getCreatedAt()
        );
    }
}
