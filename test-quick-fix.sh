#!/bin/bash

echo "Testing Wayne County Auction Game Fix..."
echo "========================================"
echo ""

# Test 1: Check if server is running
echo "1. Checking if server is running..."
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://localhost:3009/
echo ""

# Test 2: Check landing page
echo "2. Checking landing page..."
LANDING_PAGE=$(curl -s http://localhost:3009/)
if echo "$LANDING_PAGE" | grep -q "Wayne County Auction Game"; then
    echo "   ✓ Landing page title found"
else
    echo "   ✗ Landing page title not found"
fi

if echo "$LANDING_PAGE" | grep -q 'v-model="joinCode"'; then
    echo "   ✓ Join code input has v-model"
else
    echo "   ✗ Join code input missing v-model"
fi

if echo "$LANDING_PAGE" | grep -q 'v-model="studentName"'; then
    echo "   ✓ Student name input has v-model"
else
    echo "   ✗ Student name input missing v-model"
fi
echo ""

# Test 3: Check student page with WAYNE-F24
echo "3. Checking student page with WAYNE-F24..."
STUDENT_URL="http://localhost:3009/student?code=WAYNE-F24&id=test_student&name=Test%20Student"
STUDENT_PAGE=$(curl -s "$STUDENT_URL")

if echo "$STUDENT_PAGE" | grep -q "StudentDashboard"; then
    echo "   ✓ Student dashboard component found"
elif echo "$STUDENT_PAGE" | grep -q "Invalid session"; then
    echo "   ✗ Session not found error"
elif echo "$STUDENT_PAGE" | grep -q "Joining session"; then
    echo "   ⏳ Still loading..."
else
    echo "   ? Unknown state"
fi
echo ""

# Test 4: Check moderator page
echo "4. Checking moderator page..."
MODERATOR_URL="http://localhost:3009/moderator?code=WAYNE-F24"
MODERATOR_PAGE=$(curl -s "$MODERATOR_URL")

if echo "$MODERATOR_PAGE" | grep -q "ModeratorConsole"; then
    echo "   ✓ Moderator console component found"
else
    echo "   ✗ Moderator console not found"
fi
echo ""

echo "========================================"
echo "Test complete!"
echo ""
echo "To manually test:"
echo "1. Open http://localhost:3009 in your browser"
echo "2. Enter 'Test Student' as your name"
echo "3. Enter 'WAYNE-F24' as the session code"
echo "4. Click 'Join as Student'"
echo "5. Check browser console for debug messages"