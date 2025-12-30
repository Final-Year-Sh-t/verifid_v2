import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Users, 
  ArrowRight, 
  Loader2,
  Shield,
  Plus,
  Search
} from 'lucide-react';

type OnboardingStep = 'choice' | 'create' | 'join';

export default function InstitutionOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>('choice');
  const [isLoading, setIsLoading] = useState(false);
  
  // Create institution form
  const [institutionName, setInstitutionName] = useState('');
  
  // Join institution form
  const [joinCode, setJoinCode] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !institutionName.trim()) return;

    setIsLoading(true);
    try {
      const slug = institutionName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const { data: institution, error: instError } = await supabase
        .from('institutions')
        .insert({
          name: institutionName.trim(),
          slug: `${slug}-${Date.now().toString(36)}`,
          welcome_text: `Welcome to ${institutionName.trim()} verification portal`,
        })
        .select('id')
        .single();

      if (instError) throw instError;

      // Update user role to admin with institution
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ 
          role: 'admin' as const,
          institution_id: institution.id 
        })
        .eq('user_id', user.id);

      if (roleError) {
        // Try inserting if update fails
        await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'admin' as const,
            institution_id: institution.id,
          });
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ institution_id: institution.id })
        .eq('user_id', user.id);

      toast({
        title: 'Institution created!',
        description: 'You are now the admin of your institution.',
      });

      // Force page reload to refresh auth context
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Create institution error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create institution.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInstitutions = async () => {
    if (!joinCode.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('id, name, slug')
        .or(`slug.ilike.%${joinCode}%,name.ilike.%${joinCode}%`)
        .limit(5);

      if (error) throw error;

      setSearchResults(data || []);
      if (data?.length === 0) {
        toast({
          title: 'No institutions found',
          description: 'Try a different search term or ask your admin for the institution code.',
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinInstitution = async () => {
    if (!user || !selectedInstitution) return;

    setIsLoading(true);
    try {
      // Update user role with institution (keeping user role, not admin)
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ institution_id: selectedInstitution })
        .eq('user_id', user.id);

      if (roleError) {
        await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'user' as const,
            institution_id: selectedInstitution,
          });
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ institution_id: selectedInstitution })
        .eq('user_id', user.id);

      toast({
        title: 'Request submitted!',
        description: 'You have joined the institution.',
      });

      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Join error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join institution.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary mx-auto mb-4">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Welcome to VerifyID</h1>
          <p className="text-muted-foreground">
            {step === 'choice' && 'Get started by creating or joining an institution'}
            {step === 'create' && 'Create your new institution'}
            {step === 'join' && 'Find and join an existing institution'}
          </p>
        </div>

        {step === 'choice' && (
          <div className="grid gap-4">
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
              onClick={() => setStep('create')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Create Institution</h3>
                  <p className="text-sm text-muted-foreground">
                    Start fresh and set up your own verification portal
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
              onClick={() => setStep('join')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Join Institution</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with an existing institution
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'create' && (
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleCreateInstitution} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="institutionName" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Institution Name
                  </Label>
                  <Input
                    id="institutionName"
                    placeholder="Acme University"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('choice')}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gradient-primary border-0"
                    disabled={isLoading || !institutionName.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Institution'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'join' && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  Search by Name or Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="joinCode"
                    placeholder="Institution name or code..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    onClick={handleSearchInstitutions}
                    disabled={isLoading || !joinCode.trim()}
                    variant="secondary"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Institution</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {searchResults.map((inst) => (
                      <div
                        key={inst.id}
                        onClick={() => setSelectedInstitution(inst.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedInstitution === inst.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">{inst.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{inst.slug}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('choice');
                    setSearchResults([]);
                    setSelectedInstitution(null);
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleJoinInstitution}
                  className="flex-1 gradient-primary border-0"
                  disabled={isLoading || !selectedInstitution}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Joining...
                    </>
                  ) : (
                    'Join Institution'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

