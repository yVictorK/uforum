package com.ufam.uforum.controller;

import com.ufam.uforum.dto.request.CreateProductRequest;
import com.ufam.uforum.dto.request.UpdateProductRequest;
import com.ufam.uforum.dto.response.ProductResponse;
import com.ufam.uforum.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
@Tag(name = "Marketplace")
public class MarketplaceController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Listar produtos disponíveis")
    public Page<ProductResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String category) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (q != null) return productService.search(q, pageable);
        if (category != null) return productService.listByCategory(category, pageable);
        return productService.listAvailable(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhes de um produto")
    public ProductResponse getById(@PathVariable UUID id) {
        return productService.getById(id);
    }

    @GetMapping("/my")
    @Operation(summary = "Meus anúncios")
    public Page<ProductResponse> getMyProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        return productService.getMyProducts(PageRequest.of(page, size));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar anúncio no marketplace")
    public ProductResponse create(@Valid @RequestBody CreateProductRequest req) {
        return productService.create(req);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Editar anúncio")
    public ProductResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequest req) {
        return productService.update(id, req);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status do produto (AVAILABLE, RESERVED, SOLD)")
    public ProductResponse updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return productService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover anúncio")
    public void delete(@PathVariable UUID id) {
        productService.delete(id);
    }
}
