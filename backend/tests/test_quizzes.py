from app.api.quizzes import score_quiz_attempt


def test_score_quiz_attempt_normalizes_answer_formats():
    questions = [
        {
            "id": 1,
            "type": "mcq",
            "question": "Which option is correct?",
            "options": ["Option A", "Option B", "Option C"],
            "correct_answer": "Option B",
        },
        {
            "id": 2,
            "type": "mcq",
            "question": "Choose the first option",
            "options": ["Paris", "London"],
            "correctAnswer": "A",
        },
        {
            "id": 3,
            "type": "tf",
            "question": "The sky is blue.",
            "correct_answer": "True",
        },
    ]

    user_answers = ["b", "Option A", "true"]

    correct_count, total_questions, details = score_quiz_attempt(questions, user_answers)

    assert correct_count == 3
    assert total_questions == 3
    assert details[0]["is_correct"] is True
    assert details[1]["is_correct"] is True
    assert details[2]["is_correct"] is True
    assert details[0]["correct_answer"] == "Option B"
    assert details[0]["selected_answer"] == "b"
    assert details[1]["correct_answer"] == "A"
    assert details[2]["correct_answer"] == "True"
