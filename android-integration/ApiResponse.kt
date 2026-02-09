package com.example.roomsearch.data

// Updated API Response models for the new backend

data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null,
    val count: Int? = null
)

data class UserResponse(
    val success: Boolean,
    val count: Int,
    val data: List<User>
)

data class SingleUserResponse(
    val success: Boolean,
    val data: User
)

data class CreateUserResponse(
    val success: Boolean,
    val message: String,
    val data: User
)

data class MatchesResponse(
    val success: Boolean,
    val count: Int,
    val data: List<User>
)

data class HealthResponse(
    val success: Boolean,
    val message: String,
    val timestamp: String
)
