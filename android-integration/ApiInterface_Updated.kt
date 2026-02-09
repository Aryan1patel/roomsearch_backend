package com.example.roomsearch.data

import retrofit2.Response
import retrofit2.http.*

/**
 * Updated API Interface for RoomSearch Backend
 * Base URL should be set in RetrofitInstance.kt
 */
interface ApiInterface {
    
    // Health check
    @GET("health")
    suspend fun healthCheck(): Response<HealthResponse>
    
    // Get all users/listings
    @GET("api/users")
    suspend fun getUsers(): Response<UserResponse>
    
    // Get users filtered by block
    @GET("api/users")
    suspend fun getUsersByBlock(
        @Query("block") block: String
    ): Response<UserResponse>
    
    // Get users filtered by block and floor
    @GET("api/users")
    suspend fun getUsersByBlockAndFloor(
        @Query("block") block: String,
        @Query("floor") floor: String
    ): Response<UserResponse>
    
    // Get single user by ID
    @GET("api/users/{id}")
    suspend fun getUserById(
        @Path("id") userId: String
    ): Response<SingleUserResponse>
    
    // Create new room swap listing
    @POST("api/users")
    suspend fun createUser(
        @Body user: User
    ): Response<CreateUserResponse>
    
    // Find perfect matches for a user
    @GET("api/users/matches/{userId}")
    suspend fun findMatches(
        @Path("userId") userId: String
    ): Response<MatchesResponse>
    
    // Search for potential matches
    @GET("api/users/search/potential-matches")
    suspend fun searchPotentialMatches(
        @Query("currentBlock") currentBlock: String,
        @Query("currentFloor") currentFloor: String,
        @Query("desiredBlock") desiredBlock: String,
        @Query("desiredFloor") desiredFloor: String
    ): Response<MatchesResponse>
    
    // Update user listing
    @PUT("api/users/{id}")
    suspend fun updateUser(
        @Path("id") userId: String,
        @Body user: User
    ): Response<CreateUserResponse>
    
    // Delete user listing (soft delete)
    @DELETE("api/users/{id}")
    suspend fun deleteUser(
        @Path("id") userId: String
    ): Response<ApiResponse<Unit>>
}

// Create API instance
val usersApi = RetrofitInstance.api
