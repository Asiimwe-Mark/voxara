import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name || name.length < 3) {
    return NextResponse.json({ error: 'Workspace name must be at least 3 characters' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Unable to load user profile' }, { status: 500 })
  }

  if (profile.plan !== 'agency') {
    return NextResponse.json({ error: 'Workspace creation is only available for Agency plan users' }, { status: 403 })
  }

  const baseSlug = slugify(name)
  if (!baseSlug) {
    return NextResponse.json({ error: 'Workspace name must contain letters or numbers' }, { status: 400 })
  }

  let slug = baseSlug
  let collisionIndex = 0

  while (true) {
    const { data: existing, error: slugError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (slugError) {
      return NextResponse.json({ error: 'Unable to validate workspace slug' }, { status: 500 })
    }

    if (!existing) break
    collisionIndex += 1
    slug = `${baseSlug}-${collisionIndex}`
  }

  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .insert({ name, slug, created_by: user.id })
    .select('id')
    .single()

  if (orgError || !organization) {
    return NextResponse.json({ error: orgError?.message || 'Failed to create workspace' }, { status: 500 })
  }

  const { error: membershipError } = await supabase.from('organization_members').insert({
    organization_id: organization.id,
    user_id: user.id,
    role: 'owner',
  })

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message || 'Failed to assign workspace owner' }, { status: 500 })
  }

  await supabase
    .from('profiles')
    .update({ current_organization_id: organization.id })
    .eq('id', user.id)

  return NextResponse.json({ success: true, organizationId: organization.id }, { status: 201 })
}
