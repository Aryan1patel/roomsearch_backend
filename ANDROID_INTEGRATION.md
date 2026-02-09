# Android App Integration Guide

This guide explains how to integrate your Android RoomSearch app with the new backend.

## Step 1: Update RetrofitInstance.kt

Replace the BASE_URL in your `RetrofitInstance.kt`:

```kotlin
// For local development
private const val BASE_URL = "http://10.0.2.2:5000/"  // Android emulator
// OR
private const val BASE_URL = "http://YOUR_LOCAL_IP:5000/"  // Physical device

// For production (after deployment)
private const val BASE_URL = "https://your-backend-url.com/"
```

**Note for Android Emulator:**
- Use `10.0.2.2` instead of `localhost` to access your computer's localhost
- Make sure your backend is running on port 5000

**Note for Physical Device:**
- Find your computer's local IP address:
  - macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
  - Use that IP address (e.g., `http://192.168.1.100:5000/`)
- Make sure your phone and computer are on the same WiFi network

## Step 2: Update Data Models

### Update `ApiResponse.kt`

Replace the content with:

```kotlin
package com.example.roomsearch.data

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
```

### Update `User.kt`

Make sure your User model matches the backend schema:

```kotlin
package com.example.roomsearch.data

data class User(
    val _id: String = "",
    val email: String,
    val name: String,
    val phoneNo: String,
    val currentHostelBlock: String,
    val currentFloor: String,
    val desiredHostelBlock: String,
    val desiredFloor: String,
    val isActive: Boolean = true,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val __v: Int = 0
)
```

## Step 3: Update ApiInterface.kt

Replace your `ApiInterface.kt` with:

```kotlin
package com.example.roomsearch.data

import retrofit2.Response
import retrofit2.http.*

interface ApiInterface {
    
    @GET("health")
    suspend fun healthCheck(): Response<HealthResponse>
    
    @GET("api/users")
    suspend fun getUsers(): Response<UserResponse>
    
    @GET("api/users")
    suspend fun getUsersByBlock(
        @Query("block") block: String
    ): Response<UserResponse>
    
    @GET("api/users")
    suspend fun getUsersByBlockAndFloor(
        @Query("block") block: String,
        @Query("floor") floor: String
    ): Response<UserResponse>
    
    @POST("api/users")
    suspend fun createUser(
        @Body user: User
    ): Response<CreateUserResponse>
    
    @GET("api/users/matches/{userId}")
    suspend fun findMatches(
        @Path("userId") userId: String
    ): Response<MatchesResponse>
    
    @GET("api/users/search/potential-matches")
    suspend fun searchPotentialMatches(
        @Query("currentBlock") currentBlock: String,
        @Query("currentFloor") currentFloor: String,
        @Query("desiredBlock") desiredBlock: String,
        @Query("desiredFloor") desiredFloor: String
    ): Response<MatchesResponse>
    
    @PUT("api/users/{id}")
    suspend fun updateUser(
        @Path("id") userId: String,
        @Body user: User
    ): Response<CreateUserResponse>
    
    @DELETE("api/users/{id}")
    suspend fun deleteUser(
        @Path("id") userId: String
    ): Response<ApiResponse<Unit>>
}
```

## Step 4: Update UserRepository.kt

Update your repository to use the new API responses:

```kotlin
package com.example.roomsearch.data

import android.util.Log

class UserRepository {
    private val api = RetrofitInstance.api

    suspend fun getUsers(): List<User> {
        return try {
            val response = api.getUsers()
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data ?: emptyList()
            } else {
                Log.e("UserRepository", "Error: ${response.message()}")
                emptyList()
            }
        } catch (e: Exception) {
            Log.e("UserRepository", "Exception: ${e.message}")
            emptyList()
        }
    }

    suspend fun getUsersByBlock(block: String): List<User> {
        return try {
            val response = api.getUsersByBlock(block)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            Log.e("UserRepository", "Exception: ${e.message}")
            emptyList()
        }
    }

    suspend fun createUser(user: User): User? {
        return try {
            val response = api.createUser(user)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data
            } else {
                Log.e("UserRepository", "Error creating user: ${response.message()}")
                null
            }
        } catch (e: Exception) {
            Log.e("UserRepository", "Exception: ${e.message}")
            null
        }
    }

    suspend fun findMatches(userId: String): List<User> {
        return try {
            val response = api.findMatches(userId)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            Log.e("UserRepository", "Exception: ${e.message}")
            emptyList()
        }
    }

    suspend fun searchPotentialMatches(
        currentBlock: String,
        currentFloor: String,
        desiredBlock: String,
        desiredFloor: String
    ): List<User> {
        return try {
            val response = api.searchPotentialMatches(
                currentBlock, currentFloor, desiredBlock, desiredFloor
            )
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            Log.e("UserRepository", "Exception: ${e.message}")
            emptyList()
        }
    }
}
```

## Step 5: Update UserViewModel.kt

Update your ViewModel to handle the new repository methods:

```kotlin
package com.example.roomsearch.viewModel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.roomsearch.data.User
import com.example.roomsearch.data.UserRepository
import kotlinx.coroutines.launch

class UserViewModel : ViewModel() {
    private val repository = UserRepository()

    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _matches = MutableLiveData<List<User>>()
    val matches: LiveData<List<User>> = _matches

    init {
        fetchUsers()
    }

    fun fetchUsers() {
        viewModelScope.launch {
            _isLoading.value = true
            val userList = repository.getUsers()
            _users.value = userList
            _isLoading.value = false
        }
    }

    fun fetchUsersByBlock(block: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val userList = repository.getUsersByBlock(block)
            _users.value = userList
            _isLoading.value = false
        }
    }

    fun submitUser(user: User) {
        viewModelScope.launch {
            val createdUser = repository.createUser(user)
            if (createdUser != null) {
                // Refresh the list
                fetchUsers()
            }
        }
    }

    fun findMatches(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val matchList = repository.findMatches(userId)
            _matches.value = matchList
            _isLoading.value = false
        }
    }

    fun searchPotentialMatches(
        currentBlock: String,
        currentFloor: String,
        desiredBlock: String,
        desiredFloor: String
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            val matchList = repository.searchPotentialMatches(
                currentBlock, currentFloor, desiredBlock, desiredFloor
            )
            _matches.value = matchList
            _isLoading.value = false
        }
    }
}
```

## Step 6: Update Form.kt

Uncomment and update the submit functionality:

```kotlin
// In the Button onClick handler
Button(
    onClick = {
        if (email.value.isEmpty() || name.value.isEmpty() || currentHostelBlock.value.isEmpty()) {
            Toast.makeText(context, "Please fill out all required fields", Toast.LENGTH_SHORT).show()
        } else {
            val user = User(
                email = email.value,
                name = name.value,
                phoneNo = phoneNo.value,
                currentHostelBlock = currentHostelBlock.value.lowercase(),
                currentFloor = currentFloor.value,
                desiredHostelBlock = desiredHostelBlock.value.lowercase(),
                desiredFloor = desiredFloor.value
            )
            userViewModel.submitUser(user)
            Toast.makeText(context, "Listing created successfully!", Toast.LENGTH_SHORT).show()
            navController.navigate("list")
        }
    },
    modifier = Modifier.size(height = 50.dp, width = 150.dp)
) {
    Text(text = "SUBMIT", fontFamily = FontFamily(Font(R.font.fontnew, FontWeight.Bold)))
}
```

## Step 7: Update List.kt to Use Block Filter

Update the dropdown selection to filter users:

```kotlin
DropdownMenuBlock { selected ->
    SelectedBlock = selected
    // Filter users by selected block
    userViewModel.fetchUsersByBlock(selected.lowercase())
}
```

## Step 8: Add Internet Permission

Make sure your `AndroidManifest.xml` has internet permission (already present):

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## Step 9: Network Security Configuration (for HTTP in development)

If using HTTP (not HTTPS) for local development, create `res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

And add to `AndroidManifest.xml`:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

## Testing the Integration

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verify backend is running:**
   - Open browser: `http://localhost:5000`
   - You should see the API welcome message

3. **Run your Android app:**
   - Build and run the app
   - Try creating a listing
   - Check if listings appear

4. **Check logs:**
   - Backend logs in terminal
   - Android logs in Logcat (filter by "UserRepository" or "Retrofit")

## Troubleshooting

### "Unable to resolve host" error
- Check BASE_URL is correct
- For emulator, use `10.0.2.2` instead of `localhost`
- For physical device, use your computer's IP address
- Ensure backend is running

### "Connection refused" error
- Backend might not be running
- Check firewall settings
- Verify port 5000 is not blocked

### Empty list
- Check backend logs for errors
- Verify MongoDB is running
- Use Postman to test backend directly
- Check Logcat for API errors

### Data not saving
- Check backend logs
- Verify all required fields are provided
- Check MongoDB connection

## Production Deployment

When deploying to production:

1. Deploy backend to Render/Railway/Heroku
2. Update `BASE_URL` in RetrofitInstance.kt to your production URL
3. Use HTTPS (not HTTP)
4. Remove or update network security config

## Additional Features to Implement

1. **Show matches on a separate screen**
2. **Add pull-to-refresh on list**
3. **Add search functionality**
4. **Show loading indicators**
5. **Add error handling with user-friendly messages**
6. **Implement user authentication**
7. **Add ability to edit/delete own listings**

Happy coding! 🚀
