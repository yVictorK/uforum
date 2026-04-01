package com.ufam.uforum.exception;
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " não encontrado(a) com id: " + id);
    }
}
