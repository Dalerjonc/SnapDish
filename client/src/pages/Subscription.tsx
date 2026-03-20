import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Subscription = {
  plan: "free" | "pro";
  expiresAt: string | null;
};

export default function Subscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sub, isLoading } = useQuery<Subscription>({
    queryKey: ["/api/subscription"],
  });

  const upgradeMutation = useMutation({
    mutationFn: () =>
      fetch("/api/subscription/upgrade", { method: "POST" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      toast({ title: "🎉 Upgraded to Pro!", description: "Enjoy unlimited access." });
    },
  });

  const isPro = sub?.plan === "pro";

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-gray-500 mt-1">
          Current plan:{" "}
          <Badge variant={isPro ? "default" : "secondary"}>
            {isPro ? "Pro" : "Free"}
          </Badge>
        </p>
        {isPro && sub?.expiresAt && (
          <p className="text-sm text-gray-400 mt-1">
            Expires: {new Date(sub.expiresAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="grid gap-4">
        {/* Free Plan */}
        <Card className={!isPro ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Get started for free</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "5 dish identifications per day",
              "Basic recipe search",
              "Recipe details & instructions",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
            {!isPro && (
              <Badge variant="outline" className="mt-2">
                Current Plan
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={isPro ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pro ⭐
              <Badge>$9.99/month</Badge>
            </CardTitle>
            <CardDescription>Unlock all features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "Unlimited dish identifications",
              "AI Nutrition analysis",
              "Personalized meal plan generation",
              "Chat with AI chef — nutrition questions included",
              "Priority support",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
            {isPro ? (
              <Badge variant="outline" className="mt-2">
                Current Plan
              </Badge>
            ) : (
              <Button
                className="w-full mt-4"
                onClick={() => upgradeMutation.mutate()}
                disabled={upgradeMutation.isPending}
              >
                {upgradeMutation.isPending ? "Upgrading..." : "Upgrade to Pro"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
