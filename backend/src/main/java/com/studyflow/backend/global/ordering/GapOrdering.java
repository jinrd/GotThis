package com.studyflow.backend.global.ordering;

// 간격(Gap) 방식 순서 값 계산. DB 도 JPA 도 모르는 순수 계산이다.
public final class GapOrdering {
    public static final double GAP = 65536; // 2^16: 중간값 계산이 2진수로 깔끔하게 떨어진다
    private static final double MIN_GAP = 0.0001;   // 이보다 좁으면 재정렬

    private GapOrdering() {}

    // 줄의 맨 뒤 값 . 빈 줄이면 last는 null
    public static double after(Double last) {
        return (last == null) ? GAP : last + GAP;
    }

    // prev 와 next 사이값 . null 은 "그 쪽에 카드가 없음"(맨 앞 / 맨 뒤)
    public static double between(Double prev, Double next) {
        if(next == null) {
            return after(prev);
        }

        double low = (prev == null) ? 0.0 : prev;
        return (low + next) / 2.0;
    }

    // 사이에 넣을 공간이 충분한지
    public static boolean hasRoom(Double prev, Double next) {
        if(next == null) {
            return true; // 맨 뒤는 항상 공간이 있다.
        }

        double low = (prev == null) ? 0.0 : prev;

        return next - low >= MIN_GAP;
    }

    // 재정렬할 때 index번째(0부터) 카드의 값
    public static double nth(int index) {
        return (index + 1) * GAP;
    }
}
