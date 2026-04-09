import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star, MessageSquare, Target, Calendar } from 'lucide-react';

export default function PerformanceReviews() {
  const { user, isManager } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = isManager 
      ? query(collection(db, 'reviews'), orderBy('date', 'desc'))
      : query(collection(db, 'reviews'), where('employeeId', '==', user.uid), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reviews'));

    return () => unsubscribe();
  }, [user, isManager]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Performance Reviews</h1>
          <p className="text-neutral-500">Track your growth, feedback, and career goals.</p>
        </div>
        {isManager && (
          <Button className="bg-neutral-900 hover:bg-neutral-800 gap-2">
            <Star size={18} />
            <span>Write Review</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews.length > 0 ? reviews.map((review) => (
          <Card key={review.id} className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-neutral-50 bg-neutral-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Star className="text-amber-400 fill-amber-400" size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{review.period} Review</CardTitle>
                    <p className="text-xs text-neutral-500">Completed on {new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{review.rating}</span>
                  <span className="text-neutral-400 text-sm">/ 5.0</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-neutral-900 font-semibold">
                    <MessageSquare size={18} className="text-neutral-400" />
                    <span>Feedback</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl">
                    {review.feedback}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-neutral-900 font-semibold">
                    <Target size={18} className="text-neutral-400" />
                    <span>Goals & Objectives</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl">
                    {review.goals || "No specific goals set for this period."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-neutral-100">
            <Star className="mx-auto text-neutral-200 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-neutral-900">No reviews yet</h3>
            <p className="text-neutral-500 max-w-xs mx-auto mt-2">
              Your performance reviews will appear here once completed by your manager.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
